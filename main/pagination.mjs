import { renderPosts } from './post.mjs';
import { fetchPosts } from './post.mjs';

export function paginate(pagination, filters, token) {
    const { size, count, current } = pagination;
    const totalPages = count;
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

    const MAX_VISIBLE_PAGES = 10; 

    const createButton = (text, page, isActive = false, isDisabled = false) => {
        const button = document.createElement('button');
        button.textContent = text;
        button.disabled = isDisabled;
        if (isActive) button.className = 'active';
        button.addEventListener('click', () => changePage(page, filters, token));
        return button;
    };

    paginationContainer.appendChild(
        createButton('«', current - 1, false, current === 1)
    );

    const start = Math.max(1, current - Math.floor(MAX_VISIBLE_PAGES / 2));
    const end = Math.min(totalPages, start + MAX_VISIBLE_PAGES - 1);

    if (start > 1) {
        paginationContainer.appendChild(createButton(1, 1));
        if (start > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        }
    }

    for (let i = start; i <= end; i++) {
        paginationContainer.appendChild(createButton(i, i, i === current));
    }

    if (end < totalPages) {
        if (end < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        }
        paginationContainer.appendChild(createButton(totalPages, totalPages));
    }

    paginationContainer.appendChild(
        createButton('»', current + 1, false, current === totalPages)
    );
}

async function changePage(page, filters, token) {
    try {
        filters.page = page;
        const { posts, pagination } = await fetchPosts(filters, token);
        renderPosts(posts);
        paginate(pagination, filters, token);
    } catch (error) {
        console.error('Ошибка при переключении страницы:', error.message);
    }
}
