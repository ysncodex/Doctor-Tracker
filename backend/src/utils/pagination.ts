export interface PaginationOptions {
  page?: unknown;
  limit?: unknown;
}

export function getPagination(options: PaginationOptions) {
  const pageValue = Number(options.page ?? 1);
  const limitValue = Number(options.limit ?? 10);

  const page = Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1;

  const limit = Number.isSafeInteger(limitValue) && limitValue > 0 ? Math.min(limitValue, 100) : 10;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

export function paginationMeta(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
