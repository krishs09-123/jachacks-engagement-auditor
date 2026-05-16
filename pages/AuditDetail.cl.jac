import from "@jac/runtime" {
    Link as RuntimeLink,
    useNavigate as runtimeUseNavigate,
    useParams as runtimeUseParams,
}
sv import from ..services.audits { export_report }
sv import from ..services.models { AuditRunView, ExportReport, PageSnapshot }
import from ..hooks.useAuditRun { useAuditRun }
import from ..components.AppShell { AppShell }
import from ..components.ui.Button { Button }
import from ..components.ui.Card { Card, CardContent, CardDescription, CardHeader, CardTitle }
import from ..components.ui.Progress { Progress }
import from ..components.ui.Badge { Badge }
import from ..components.ui.Table { Table, TableBody, TableCell, TableHead, TableHeader, TableRow }
import from ..components.ui.Tabs { Tabs, TabButton, TabList }
import from ..components.ui.Dialog { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle }
import from ..components.ui.Alert { Alert }

def:pub AuditDetailPage() -> JsxElement {
    has showExport: bool = False;
    has exported: ExportReport | None = None;
    params = runtimeUseParams();
    audit_id: str = str(params["id"]);
    navigate = runtimeUseNavigate();
    auditState = useAuditRun(audit_id);
    view: AuditRunView | None = auditState.view;
    project_name: str = "Audit run";
    target_url: str = "Loading...";
    has_run: bool = False;
    retention_score: int = 0;
    conversion_score: int = 0;
    run_status: str = "";
    completed_at: str = "";
    crawl_summary: str = "";
    legal_filter_summary: str = "";
    export_markdown: str = "";
    snapshots_count: int = 0;
    recommendations_count: int = 0;
    snapshots: list[PageSnapshot] = [];
    if view is not None and view.project is not None {
        project_name = view.project.name;
    }
    if view is not None and view.run is not None {
        has_run = True;
        target_url = view.run.target_url;
        retention_score = view.run.retention_score;
        conversion_score = view.run.conversion_score;
        run_status = view.run.status;
        completed_at = view.run.completed_at;
        crawl_summary = view.run.crawl_summary;
        legal_filter_summary = view.run.legal_filter_summary;
    }
    if view is not None {
        snapshots = view.snapshots;
        snapshots_count = len(view.snapshots);
        recommendations_count = len(view.recommendations);
    }
    if exported is not None {
        export_markdown = exported.markdown;
    }

    async def handleExport() -> None {
        export_result: ExportReport | None = None;
        export_result = await export_report(audit_id);
        exported = export_result;
        if export_result is not None and export_result.ok {
            showExport = True;
        }
    }

    def goOverview() -> None {
        navigate("/audits/" + audit_id);
    }

    def goRetention() -> None {
        navigate("/audits/" + audit_id + "/retention");
    }

    def goConversion() -> None {
        navigate("/audits/" + audit_id + "/conversion");
    }

    def goExperiments() -> None {
        navigate("/audits/" + audit_id + "/experiments");
    }

    def closeExport() -> None {
        showExport = False;
    }

    return <AppShell auditId={audit_id}>
        <header className="page-header">
            <div>
                <p className="eyebrow">Audit detail</p>
                <h1>{project_name}</h1>
                <p className="page-subtitle">{target_url}</p>
            </div>
            <Button variant="secondary" onClick={handleExport}>Export report</Button>
        </header>

        {auditState.error != "" and <Alert tone="danger">{auditState.error}</Alert>}
        {auditState.loading and <p className="empty-state">Loading audit...</p>}

        <Tabs>
            <TabList>
                <TabButton active={True} onClick={goOverview}>Overview</TabButton>
                <TabButton onClick={goRetention}>Retention</TabButton>
                <TabButton onClick={goConversion}>Conversion</TabButton>
                <TabButton onClick={goExperiments}>Experiments</TabButton>
            </TabList>
        </Tabs>

        {has_run and <div className="score-grid">
            <Card>
                <CardHeader>
                    <CardTitle>Retention score</CardTitle>
                    <CardDescription>Stickiness, habit loops, motivation, autonomy, competence, relatedness.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Progress value={retention_score} label="Retention score" />
                    <RuntimeLink className="table-link" to={"/audits/" + audit_id + "/retention"}>Open retention report</RuntimeLink>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Conversion score</CardTitle>
                    <CardDescription>Activation, CTA clarity, trust, pricing clarity, task success, revenue path.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Progress value={conversion_score} label="Conversion score" />
                    <RuntimeLink className="table-link" to={"/audits/" + audit_id + "/conversion"}>Open conversion report</RuntimeLink>
                </CardContent>
            </Card>
        </div>}

        {has_run and <Card>
            <CardHeader>
                <CardTitle>Run summary</CardTitle>
                <CardDescription>{run_status} / {completed_at}</CardDescription>
            </CardHeader>
            <CardContent>
                <p>{crawl_summary}</p>
                <p>{legal_filter_summary}</p>
                <div className="action-row">
                    <RuntimeLink className="table-link" to={"/audits/" + audit_id + "/experiments"}>Open experiment backlog</RuntimeLink>
                    <Badge tone="neutral">{snapshots_count} snapshots</Badge>
                    <Badge tone="neutral">{recommendations_count} recommendations</Badge>
                </div>
            </CardContent>
        </Card>}

        {snapshots_count > 0 and <Card>
            <CardHeader>
                <CardTitle>Captured evidence</CardTitle>
                <CardDescription>Sanitized snapshots; raw form values and scripts are not stored.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeader>Page</TableHeader>
                            <TableHeader>Signals</TableHeader>
                            <TableHeader>Excerpt</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {[<TableRow key={snapshot.uid}>
                            <TableCell><span className="mono-url">{snapshot.page_url}</span></TableCell>
                            <TableCell>{snapshot.form_count} forms / {snapshot.input_count} inputs / {len(snapshot.ctas)} CTAs</TableCell>
                            <TableCell>{snapshot.text_excerpt}</TableCell>
                        </TableRow> for snapshot in snapshots]}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>}

        <Dialog open={showExport}>
            <DialogHeader>
                <DialogTitle>Exported markdown</DialogTitle>
            </DialogHeader>
            <DialogContent>
                <pre className="report-export">{export_markdown}</pre>
            </DialogContent>
            <DialogFooter>
                <Button onClick={closeExport}>Close</Button>
            </DialogFooter>
        </Dialog>
    </AppShell>;
}
