import re;

import from services.models { PageSnapshot, FlowStep, DeterministicSignal }

def joined_snapshot_text(snapshots: list[PageSnapshot]) -> str {
    parts: list[str] = [];
    for snap in snapshots {
        parts.append((snap.title + " " + " ".join(snap.headings) + " " + " ".join(snap.ctas) + " " + snap.text_excerpt).lower());
    }
    return " ".join(parts);
}

def first_page_url(snapshots: list[PageSnapshot]) -> str {
    if len(snapshots) > 0 {
        return snapshots[0].page_url;
    }
    return "";
}

def contains_any(text: str, terms: list[str]) -> bool {
    lowered: str = text.lower();
    for term in terms {
        if term.lower() in lowered {
            return True;
        }
    }
    return False;
}

def count_cta_matches(snapshots: list[PageSnapshot], terms: list[str]) -> int {
    count: int = 0;
    for snap in snapshots {
        for cta in snap.ctas {
            if contains_any(cta, terms) {
                count += 1;
            }
        }
    }
    return count;
}

def make_signal(
    lane: str,
    category: str,
    severity: str,
    confidence: float,
    page_url: str,
    evidence: str,
    research_basis: str,
    recommendation: str,
    exact_tip: str,
    hypothesis: str,
    primary_metric: str,
    guardrail_metric: str,
    effort: str,
    impact: str,
) -> DeterministicSignal {
    return DeterministicSignal(
        lane_retention_or_conversion=lane,
        category=category,
        severity=severity,
        confidence=confidence,
        page_url=page_url,
        evidence=evidence,
        research_basis=research_basis,
        recommendation=recommendation,
        exact_ui_or_copy_tip=exact_tip,
        experiment_hypothesis=hypothesis,
        primary_metric=primary_metric,
        guardrail_metric=guardrail_metric,
        estimated_effort=effort,
        expected_impact=impact,
    );
}

def deterministic_audit(snapshots: list[PageSnapshot], flow_steps: list[FlowStep]) -> list[DeterministicSignal] {
    signals: list[DeterministicSignal] = [];
    text: str = joined_snapshot_text(snapshots);
    page_url: str = first_page_url(snapshots);
    signup_terms: list[str] = ["start", "sign up", "signup", "join", "try", "get started", "create account", "download"];
    value_terms: list[str] = ["save", "faster", "easier", "without", "so you can", "because", "personalized", "recommend"];
    trust_terms: list[str] = ["privacy", "secure", "trusted", "reviews", "customers", "testimonial", "guarantee", "terms"];
    pricing_terms: list[str] = ["pricing", "price", "$", "free trial", "subscription", "plan"];
    habit_terms: list[str] = ["reminder", "streak", "daily", "weekly", "notification", "save", "track", "progress"];
    autonomy_terms: list[str] = ["choose", "customize", "control", "preferences", "skip", "not now"];
    competence_terms: list[str] = ["progress", "score", "level", "checklist", "complete", "next step"];
    relatedness_terms: list[str] = ["community", "team", "friends", "share", "invite", "together", "members"];

    if count_cta_matches(snapshots, signup_terms) == 0 {
        signals.append(make_signal(
            "conversion",
            "primary CTA clarity",
            "high",
            0.82,
            page_url,
            "No strong start/signup/get-started CTA was detected in captured CTA text.",
            "Fogg Behavior Model ability+prompt, AARRR activation, HEART task success",
            "Make the primary conversion action unmistakable and repeat it near the top, after proof, and at the end of the page.",
            "Use one primary button label such as 'Start free audit' or 'Create my plan' and pair it with a short risk reducer underneath.",
            "If the page uses one clear action verb and a risk reducer, activation click-through will increase because the prompt becomes easier to act on.",
            "primary CTA click-through rate",
            "bounce rate and mis-click rate",
            "low",
            "high",
        ));
    }

    if not contains_any(text, value_terms) {
        signals.append(make_signal(
            "conversion",
            "value clarity",
            "high",
            0.74,
            page_url,
            "Captured copy lacks concrete outcome words such as save, faster, easier, personalized, or because.",
            "AARRR activation, Fogg motivation, HEART happiness",
            "Translate the product promise into a concrete consumer outcome and place it before feature detail.",
            "Rewrite the opening copy as 'Do [job] in [time] without [pain]' and add one proof point directly below.",
            "If the hero names the user's job-to-be-done with a measurable outcome, more visitors will understand the offer and continue.",
            "landing-page scroll depth",
            "qualified signup rate",
            "low",
            "high",
        ));
    }

    if not contains_any(text, trust_terms) {
        signals.append(make_signal(
            "conversion",
            "trust and risk reversal",
            "medium",
            0.72,
            page_url,
            "No privacy, security, review, customer, guarantee, or terms language was detected.",
            "Persuasion principles: authority and social proof, plus HEART task success",
            "Add truthful trust builders that reduce perceived risk without inventing proof.",
            "Add a compact trust row: 'No spam. Cancel anytime. Data stays private.' Only include claims the product can honor.",
            "If truthful risk reducers appear near the CTA, more users will complete signup because perceived cost drops.",
            "signup completion rate",
            "refund/support complaint rate",
            "low",
            "medium",
        ));
    }

    if contains_any(text, ["countdown", "only today", "last chance", "spots left"]) and not contains_any(text, ["while inventory lasts", "actual availability", "limited by capacity"]) {
        signals.append(make_signal(
            "conversion",
            "legal scarcity risk",
            "critical",
            0.8,
            page_url,
            "Scarcity-style language was detected without clear evidence that the constraint is truthful.",
            "Truthful scarcity, consumer protection, dark-pattern avoidance",
            "Replace fake or unverifiable urgency with truthful capacity, deadline, or benefit framing.",
            "Use 'Enrollment closes on May 31 because onboarding capacity is capped at 200 accounts' only if that is true; otherwise say 'Start now to keep your setup momentum.'",
            "If urgency is truthful and explained, conversion can improve without increasing complaints or legal risk.",
            "conversion rate",
            "chargebacks, cancellations, complaints",
            "low",
            "high",
        ));
    }

    if not contains_any(text, habit_terms) {
        signals.append(make_signal(
            "retention",
            "habit loop trigger",
            "high",
            0.78,
            page_url,
            "No reminder, progress, streak, saved-state, or recurring trigger language was detected.",
            "Hook Model trigger/action/reward/investment and Fogg prompt",
            "Introduce a benign trigger loop that helps users return for their own goal, not a manipulative interruption.",
            "After activation, ask users to set a useful reminder cadence and show the next saved task on return.",
            "If users create a reminder tied to their own goal, week-two return rate will rise because the prompt is timely and user-controlled.",
            "D7 return rate",
            "notification opt-out rate",
            "medium",
            "high",
        ));
    }

    if not contains_any(text, autonomy_terms) {
        signals.append(make_signal(
            "retention",
            "autonomy support",
            "medium",
            0.69,
            page_url,
            "Captured content does not show choose/customize/control/skip style autonomy language.",
            "Self-Determination Theory autonomy",
            "Give users meaningful control during onboarding so engagement feels self-directed.",
            "Add setup choices like 'Pick your goal', 'Choose reminder cadence', and 'Skip for now' instead of forcing every step.",
            "If onboarding gives useful choices, more users will finish setup and feel ownership over the product.",
            "onboarding completion rate",
            "time-to-value and skipped-step recovery rate",
            "medium",
            "medium",
        ));
    }

    if not contains_any(text, competence_terms) {
        signals.append(make_signal(
            "retention",
            "competence feedback",
            "medium",
            0.7,
            page_url,
            "No progress, checklist, next-step, score, or completion language was detected.",
            "Self-Determination Theory competence, HEART task success",
            "Make progress visible so the user knows what they have achieved and what to do next.",
            "Add a 3-step progress module with one completed state after the user's first meaningful action.",
            "If users see progress and the next best action, activation-to-retention conversion will improve.",
            "activated users reaching second session",
            "support tickets from confusion",
            "low",
            "medium",
        ));
    }

    if not contains_any(text, relatedness_terms) {
        signals.append(make_signal(
            "retention",
            "relatedness and referral",
            "low",
            0.62,
            page_url,
            "No community, invite, share, team, or together language was captured.",
            "Self-Determination Theory relatedness, AARRR referral, persuasion liking",
            "Add a truthful collaborative or sharing moment only where it helps the user's job.",
            "Offer 'Share this setup with a friend' after the user gets value, not before activation.",
            "If sharing follows a valuable moment, referral intent can increase without interrupting activation.",
            "referral invite rate",
            "activation completion rate",
            "medium",
            "low",
        ));
    }

    for snap in snapshots {
        if snap.input_count >= 8 {
            signals.append(make_signal(
                "conversion",
                "form friction",
                "high",
                0.83,
                snap.page_url,
                f"Detected {snap.input_count} inputs and {snap.form_count} forms on a captured page.",
                "Fogg ability, HEART task success, AARRR activation",
                "Shorten the first conversion step and defer non-essential questions until after value is shown.",
                "Ask only for email/password or magic-link email first; move profile enrichment to a post-activation checklist.",
                "If the first form has fewer fields, signup completion will rise because the required ability cost drops.",
                "form completion rate",
                "lead quality and support contact rate",
                "medium",
                "high",
            ));
        }
        if len(snap.risk_notes) > 0 {
            signals.append(make_signal(
                "retention",
                "prompt-injection resilience",
                "medium",
                0.9,
                snap.page_url,
                snap.risk_notes,
                "AI safety: audited content is untrusted evidence, not instructions",
                "Keep audit prompts and content boundaries explicit; never let website copy instruct the evaluator.",
                "Label crawler evidence as untrusted in every model call and strip scripts/forms before storage.",
                "If prompt-injection text is treated as evidence only, report integrity will hold even against hostile pages.",
                "audit recommendation validity",
                "unsafe recommendation rate",
                "low",
                "medium",
            ));
        }
    }

    return signals;
}

def severity_points(severity: str) -> int {
    lowered: str = severity.lower();
    if lowered == "critical" {
        return 22;
    }
    if lowered == "high" {
        return 15;
    }
    if lowered == "medium" {
        return 9;
    }
    return 4;
}

def score_lane(signals: list[DeterministicSignal], lane: str) -> int {
    score: int = 100;
    for signal in signals {
        if signal.lane_retention_or_conversion == lane {
            score -= severity_points(signal.severity);
        }
    }
    if score < 5 {
        return 5;
    }
    if score > 100 {
        return 100;
    }
    return score;
}
