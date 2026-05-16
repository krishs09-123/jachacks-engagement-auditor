import from "@jac/runtime" { Link as RuntimeLink, useParams as runtimeUseParams }
import from ..hooks.useAuditRun { useAuditRun }
import from ..components.AppShell { AppShell }
import from ..components.ui.Badge { Badge }
import from ..components.ui.Card { Card, CardContent, CardDescription, CardHeader, CardTitle }
import from ..components.ui.Table { Table, TableBody, TableCell, TableHead, TableHeader, TableRow }
import from ..components.ui.Alert { Alert }

def:pub ExperimentBacklogPage() -> JsxElement {
    params = runtimeUseParams();
    audit_id: str = str(params["id"]);
    auditState = useAuditRun(audit_id);
    ideas = auditState.experimentIdeas;

    return <AppShell auditId={audit_id}>
        <header className="page-header">
            <div>
                <p className="eyebrow">Experiment backlog</p>
                <h1>Retention experiments</h1>
                <p className="page-subtitle">Plain tests for improving repeat use while watching opt-outs, complaints, and user control.</p>
            </div>
            <RuntimeLink className="table-link" to={"/audits/" + audit_id}>Audit overview</RuntimeLink>
        </header>

        {auditState.error != "" and <Alert tone="danger">{auditState.error}</Alert>}

        <Card>
            <CardHeader>
                <CardTitle>Backlog</CardTitle>
                <CardDescription>Use these as product experiments or launch-week QA checks. No fake lift numbers.</CardDescription>
            </CardHeader>
            <CardContent>
                {len(ideas) == 0 and <p className="empty-state">No experiment ideas yet.</p>}
                {len(ideas) > 0 and <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeader>Category</TableHeader>
                            <TableHeader>Experiment</TableHeader>
                            <TableHeader>Metrics</TableHeader>
                            <TableHeader>Effort</TableHeader>
                            <TableHeader>Impact</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {[<TableRow key={idea.uid}>
                            <TableCell><Badge tone="accent">retention</Badge></TableCell>
                            <TableCell>
                                <strong>{idea.title}</strong>
                                <p>{idea.hypothesis}</p>
                            </TableCell>
                            <TableCell>{idea.primary_metric} guarded by {idea.guardrail_metric}</TableCell>
                            <TableCell>{idea.estimated_effort}</TableCell>
                            <TableCell>{idea.expected_impact}</TableCell>
                        </TableRow> for idea in ideas]}
                    </TableBody>
                </Table>}
            </CardContent>
        </Card>
    </AppShell>;
}
