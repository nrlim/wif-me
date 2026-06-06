export type ProblemDetails = {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly detail: string;
};

export function problemResponse(problem: ProblemDetails): Response {
  return Response.json(problem, {
    status: problem.status,
    headers: { "Content-Type": "application/problem+json" },
  });
}

export function validationProblem(detail: string): Response {
  return problemResponse({
    type: "https://wifme.id/problems/validation-error",
    title: "Validation Error",
    status: 422,
    detail,
  });
}

export function conflictProblem(detail: string): Response {
  return problemResponse({
    type: "https://wifme.id/problems/conflict",
    title: "Conflict",
    status: 409,
    detail,
  });
}

export function serverProblem(): Response {
  return problemResponse({
    type: "https://wifme.id/problems/internal-error",
    title: "Internal Server Error",
    status: 500,
    detail: "Request could not be processed.",
  });
}
