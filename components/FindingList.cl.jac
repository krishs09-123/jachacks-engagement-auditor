sv import from ..services.models { EngagementFinding }
import from .ui.Badge { Badge }
import from .ui.Card { Card, CardContent }

def toneForSeverity(severity: str) -> str {
    lowered: str = severity.lower();
    if lowered == "critical" {
        return "danger";
    }
    if lowered == "high" {
        return "warning";
    }
    if lowered == "medium" {
        return "accent";
    }
    return "neutral";
}

def:pub FindingList(findings: list[EngagementFinding] = []) -> JsxElement {
    if len(findings) == 0 {
        return <p className="empty-state">No findings yet.</p>;
    }
    return <div className="finding-list">
        {[<Card key={finding.uid} className="finding-card">
            <CardContent>
                <div className="finding-topline">
                    <Badge tone={toneForSeverity(finding.severity)}>{finding.severity}</Badge>
                    <Badge tone="neutral">{finding.category}</Badge>
                    <Badge tone={"success" if finding.legal_safe else "danger"}>{"legal-safe" if finding.legal_safe else "needs review"}</Badge>
                </div>
                <h3>{finding.recommendation}</h3>
                <p className="evidence-text">{finding.evidence}</p>
                <dl className="finding-grid">
                    <div>
                        <dt>Research basis</dt>
                        <dd>{finding.research_basis}</dd>
                    </div>
                    <div>
                        <dt>Exact tip</dt>
                        <dd>{finding.exact_ui_or_copy_tip}</dd>
                    </div>
                    <div>
                        <dt>Hypothesis</dt>
                        <dd>{finding.experiment_hypothesis}</dd>
                    </div>
                    <div>
                        <dt>Metrics</dt>
                        <dd>{finding.primary_metric} guarded by {finding.guardrail_metric}</dd>
                    </div>
                </dl>
            </CardContent>
        </Card> for finding in findings]}
    </div>;
}
