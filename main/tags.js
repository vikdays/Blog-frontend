async function fetchTags() {
    try {
        const response = await fetch('https://blog.kreosoft.space/api/tag');
        if (!response.ok) {
            throw new Error(`Ошибка: ${response.statusText}`); 
        }
        const tags = await response.json();
        const tagSelect = document.getElementById('tags');

        if (!tagSelect) {
            console.error('Select для тегов не найден');
            return;
        }
        tagSelect.innerHTML = '';
        tags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag.id;
            option.textContent = tag.name;
            tagSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Error fetching tags:', error);
    }
}
document.addEventListener('DOMContentLoaded', fetchTags);