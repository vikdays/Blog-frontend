export const PostSorting = 
{   CreateDesc: "По дате создания (сначала новые)",
    CreateAsc: "По дате создания (сначала старые)",
    LikeAsc: "По количеству лайков (по возрастанию)",
    LikeDesc: "По количеству лайков (по убыванию)"
}
document.addEventListener('DOMContentLoaded', () => {
    const postSortingSelect = document.getElementById('postSorting');

    if (postSortingSelect) {
        Object.entries(PostSorting).forEach(([value, label]) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = label;
            postSortingSelect.appendChild(option);
        });
    } else {
        console.error('Select element for sorting not found');
    }
});