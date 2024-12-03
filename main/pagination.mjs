import { renderPosts } from './post.mjs';
import { fetchPosts } from './post.mjs';

export function paginate(pagination, filters, token) {
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
        if (isDisabled){
            link.classList.add('disabled');
            link.style.pointerEvents = 'none';
        } 
        link.addEventListener('click', (event) => {
            event.preventDefault();
            if (!isDisabled) changePage(page, filters, token);
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

export async function changePage(page, filters, token) {
    try {
        filters.page = page;
        
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('page', page);
        urlParams.set('size', filters.size);
        history.pushState(null, '', `?${urlParams.toString()}`);

        const { posts, pagination } = await fetchPosts(filters, token);
        renderPosts(posts);
        paginate(pagination, filters, token);
    } catch (error) {
        console.error('Ошибка при переключении страницы:', error.message);
    }
}
