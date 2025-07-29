const paginate = (total, page = 1, limit = 10) => {
  const totalPages = Math.ceil(total / limit);
  const currentPage = parseInt(page);
  const hasNext = currentPage < totalPages;
  const hasPrev = currentPage > 1;

  return {
    total,
    totalPages,
    currentPage,
    limit: parseInt(limit),
    hasNext,
    hasPrev,
    next: hasNext ? currentPage + 1 : null,
    prev: hasPrev ? currentPage - 1 : null
  };
};

module.exports = { paginate };