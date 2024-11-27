export function editButtonClick(commentElement, commentId) {
    const editForm = commentElement.querySelector(".edit-form");
    const currentContentElement = commentElement.querySelector(".content");
    let currentContent = currentContentElement.textContent.trim();
    currentContent = currentContent.replace("(изменен)", "").trim();
    editForm.innerHTML = `
        <input type='text' class="answer-input" value="${currentContent}"></input>
        <button class = "edit">Редактировать</button>
    `;
    
    const content = commentElement.querySelector('.content');
    content.style.display = 'none';

    const editButton = editForm.querySelector(".edit");
    const editInput = editForm.querySelector(".answer-input");
    editButton.addEventListener("click", async () => {
        const content = editInput.value.trim();
        const token = localStorage.getItem("token");
        try {
            await editComment(commentId, token, content);
            editForm.innerHTML = ''; // Удалить форму редактирования
            window.location.reload();
        } catch (error) {
            console.error("Ошибка при отправке комментария:", error.message);
        }
    });
}

async function editComment(commentId, token, data) {
    try {
        const response = await fetch(`https://blog.kreosoft.space/api/comment/${commentId}`, {
            method: "PUT",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({content: data}),
        });

        if (!response.ok) { 
            const errorText = await response.text();
            console.error("Ошибка при отправке комментария. Статус:", response.status, "Ответ:", errorText);
            return false;
        }

    } catch (error) {
        console.error("Ошибка при отправке комментария", error.message);
        return false;
    }
}
