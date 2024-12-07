export function createPagination(pagination, filters, token, onPageChange) {
    const { size, count, current } = pagination;
    const totalPages = count;
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

    const MAX_VISIBLE_PAGES = 5;

    const createLink = (text, page, isActive = false, isDisabled = false) => {
        const link = document.createElement('a');
        link.textContent = text;
        link.href = `?page=${page}&size=${size}`;
        link.className = isActive ? 'active' : "";
        if (isDisabled) {
            link.classList.add('disabled');
            link.style.pointerEvents = 'none';
        }
        link.addEventListener('click', (event) => {
            event.preventDefault();
            if (!isDisabled) onPageChange(page);
        });
        return link;
    };

    paginationContainer.appendChild(
        createLink('«', current - 1, false, current === 1)
    );

    const start = Math.max(1, current - Math.floor(MAX_VISIBLE_PAGES / 2));
    const end = Math.min(totalPages, start + MAX_VISIBLE_PAGES - 1);

    if (start > 1) {
        paginationContainer.appendChild(createLink(1, 1));
        if (start > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        }
    }

    for (let i = start; i <= end; i++) {
        paginationContainer.appendChild(createLink(i, i, i === current));
    }

    if (end < totalPages) {
        if (end < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        }
        paginationContainer.appendChild(createLink(totalPages, totalPages));
    }

    paginationContainer.appendChild(
        createLink('»', current + 1, false, current === totalPages)
    );
}
