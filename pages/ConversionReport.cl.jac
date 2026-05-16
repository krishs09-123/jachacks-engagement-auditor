import from "@jac/runtime" { Link as RuntimeLink, useParams as runtimeUseParams }
import from ..hooks.useAuditRun { useAuditRun }
import from ..components.AppShell { AppShell }
import from ..components.FindingList { FindingList }
import from ..components.ui.Card { Card, CardContent, CardDescription, CardHeader, CardTitle }
import from ..components.ui.Progress { Progress }
import from ..components.ui.Alert { Alert }

def:pub ConversionReportPage() -> JsxElement {
    params = runtimeUseParams();
    audit_id: str = str(params["id"]);
    auditState = useAuditRun(audit_id);
    view = auditState.view;
    has_run: bool = False;
    conversion_score: int = 0;
    if view is not None and view.run is not None {
        has_run = True;
        conversion_score = view.run.conversion_score;
    }

    return <AppShell auditId={audit_id}>
        <header className="page-header">
            <div>
                <p className="eyebrow">Conversion report</p>
                <h1>Activation and revenue path</h1>
                <p className="page-subtitle">CTA clarity, trust, task success, pricing clarity, activation, and ethical persuasion.</p>
            </div>
            <RuntimeLink className="table-link" to={"/audits/" + audit_id}>Audit overview</RuntimeLink>
        </header>

        {auditState.error != "" and <Alert tone="danger">{auditState.error}</Alert>}
        {has_run and <Card>
            <CardHeader>
                <CardTitle>Conversion score</CardTitle>
                <CardDescription>Separate from retention so short-term conversion does not hide weak long-term engagement.</CardDescription>
            </CardHeader>
            <CardContent>
                <Progress value={conversion_score} label="Conversion score" />
            </CardContent>
        </Card>}

        <FindingList findings={auditState.conversionFindings} />
    </AppShell>;
}
