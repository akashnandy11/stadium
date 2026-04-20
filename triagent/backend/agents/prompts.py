from models.report import SecurityFinding


def build_architect_prompt(ticket, context: str, prior_code: str, failed_tests: str, findings: list, round_num: int) -> str:
    base = f"""You are the Architect agent in the TriAgent system.
Your job: Given a Jira ticket description and relevant codebase context, write clean, production-ready implementation code.

Rules:
- Write only the implementation code (no tests, no main harness)
- Include inline docstrings and type hints
- Follow SOLID principles and language-specific best practices
- Use parameterized queries for any DB operations
- Hash passwords with bcrypt, never store plaintext
- Handle edge cases: empty inputs, concurrent requests, null values
- If given feedback from Adversary or Sentinel, fix EVERY failing test and EVERY security finding

TICKET TITLE: {ticket.title}
TICKET DESCRIPTION: {ticket.description}
LANGUAGE: {ticket.language}

CODEBASE CONTEXT:
{context or "No codebase context available."}
"""
    if round_num > 1:
        base += f"""

=== ROUND {round_num} — FIX REQUIRED ===
Your previous implementation had failures. Fix ALL of them now.

PRIOR CODE:
{prior_code}

FAILING TESTS:
{failed_tests or "None"}

SECURITY FINDINGS TO FIX:
{chr(10).join(f"- [{f.severity}] {f.owasp_id}: {f.title} — {f.description}" for f in findings) if findings else "None"}
"""

    base += """
Output format:
<code>
# full implementation here
</code>
<explanation>
Brief explanation of key design decisions
</explanation>
"""
    return base


def build_adversary_prompt(code: str, language: str) -> str:
    return f"""You are the Adversary agent in the TriAgent system.
Your job: Given implementation code, write adversarial unit tests designed to FIND BUGS AND BREAK IT.

Test categories you MUST cover:
- Happy path (1-2 tests)
- Empty/null inputs
- Boundary values (0, -1, max int, empty string, whitespace-only)
- SQL injection strings (e.g. "'; DROP TABLE users;--")
- XSS payloads (e.g. "<script>alert(1)</script>")
- Concurrent/race condition simulation
- Extremely long inputs (10000 chars)
- Special characters and unicode
- Type mismatches
- Authentication bypass attempts

Use PyTest. Import the module under test directly.

LANGUAGE: {language}

CODE TO TEST:
{code}

Output format:
<tests>
import pytest
# all tests here
</tests>
<summary>
N tests written. Identified potential failures: [list]
</summary>
"""


def build_sentinel_prompt(code: str) -> str:
    return f"""You are the Sentinel agent in the TriAgent system.
Your job: Perform a rigorous security review of implementation code. Map every finding to an OWASP Top 10 2021 category.

Check for ALL of the following:
- A01: Broken Access Control (missing auth checks, IDOR)
- A02: Cryptographic Failures (plaintext secrets, weak hashing, no TLS)
- A03: Injection (SQL, NoSQL, LDAP, OS command, XSS)
- A04: Insecure Design (missing rate limiting, no input validation)
- A05: Security Misconfiguration (debug mode, default creds, verbose errors)
- A06: Vulnerable Components (known-bad library usage)
- A07: Auth Failures (weak sessions, no lockout, insecure JWT)
- A08: Integrity Failures (unsafe deserialization, unverified updates)
- A09: Logging Failures (passwords in logs, missing audit trail)
- A10: SSRF (unvalidated URLs, internal network access)

CODE TO REVIEW:
{code}

For each finding output:
SEVERITY: CRITICAL | HIGH | MEDIUM | LOW | INFO
OWASP: A0X:2021 — Name
TITLE: Short title
LINE: line number if identifiable
SCORE: CVSS-like 0.0-10.0
DESCRIPTION: What the vulnerability is and how to fix it

End with:
TOTAL_ISSUES: N
CONFIDENCE_SCORE: X.X/10

Output format:
<findings>
[structured list above]
</findings>
"""


def parse_code_block(output: str) -> str:
    """Extract content between <code> tags."""
    if "<code>" in output and "</code>" in output:
        return output.split("<code>")[1].split("</code>")[0].strip()
    # Fallback: try markdown code block
    if "```" in output:
        parts = output.split("```")
        if len(parts) >= 3:
            code = parts[1]
            # Remove language identifier if present
            lines = code.split("\n")
            if lines[0].strip() in ("python", "javascript", "java", "go", ""):
                code = "\n".join(lines[1:])
            return code.strip()
    return output.strip()


def parse_tests_block(output: str) -> str:
    """Extract content between <tests> tags."""
    if "<tests>" in output and "</tests>" in output:
        return output.split("<tests>")[1].split("</tests>")[0].strip()
    if "```" in output:
        parts = output.split("```")
        if len(parts) >= 3:
            return parts[1].strip()
    return output.strip()


def parse_sentinel_findings(output: str) -> list[SecurityFinding]:
    """Parse Sentinel agent output into SecurityFinding objects."""
    findings = []
    content = output
    if "<findings>" in output and "</findings>" in output:
        content = output.split("<findings>")[1].split("</findings>")[0]

    blocks = content.strip().split("\n\n")
    for block in blocks:
        if not block.strip():
            continue
        lines = block.strip().split("\n")
        finding_data = {}
        for line in lines:
            if line.startswith("SEVERITY:"):
                finding_data["severity"] = line.split(":", 1)[1].strip()
            elif line.startswith("OWASP:"):
                owasp_str = line.split(":", 1)[1].strip()
                finding_data["owasp_id"] = owasp_str.split("—")[0].strip() if "—" in owasp_str else owasp_str
            elif line.startswith("TITLE:"):
                finding_data["title"] = line.split(":", 1)[1].strip()
            elif line.startswith("LINE:"):
                try:
                    finding_data["line_number"] = int(line.split(":", 1)[1].strip())
                except ValueError:
                    finding_data["line_number"] = None
            elif line.startswith("SCORE:"):
                try:
                    finding_data["score"] = float(line.split(":", 1)[1].strip())
                except ValueError:
                    finding_data["score"] = 5.0
            elif line.startswith("DESCRIPTION:"):
                finding_data["description"] = line.split(":", 1)[1].strip()

        valid_severities = {"CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"}
        if (
            "severity" in finding_data
            and finding_data.get("severity") in valid_severities
            and "title" in finding_data
        ):
            findings.append(
                SecurityFinding(
                    severity=finding_data.get("severity", "INFO"),
                    owasp_id=finding_data.get("owasp_id", "A00:2021"),
                    title=finding_data.get("title", "Unknown"),
                    description=finding_data.get("description", ""),
                    line_number=finding_data.get("line_number"),
                    score=finding_data.get("score", 5.0),
                )
            )
    return findings


def calculate_confidence(findings: list, test_results) -> float:
    """Calculate a 0-10 confidence score from test results and security findings."""
    score = 10.0
    for f in findings:
        if f.severity == "CRITICAL":
            score -= 2.0
        elif f.severity == "HIGH":
            score -= 1.5
        elif f.severity == "MEDIUM":
            score -= 0.75
        elif f.severity == "LOW":
            score -= 0.25

    if test_results.total > 0:
        fail_ratio = test_results.failed / test_results.total
        score -= fail_ratio * 3.0

    return max(0.0, min(10.0, round(score, 1)))
