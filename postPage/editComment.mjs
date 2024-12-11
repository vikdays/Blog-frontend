export function editButtonClick(commentElement, commentId) {
    const editForm = commentElement.querySelector(".edit-form");
    const contentElement = commentElement.querySelector(".content");

    if (editForm.hasChildNodes()) {
        editForm.innerHTML = '';
        contentElement.style.display = 'block';
        return;
    }

    let currentContent = contentElement.textContent.trim();
    currentContent = currentContent.replace("(изменен)", "").trim();

    const input = document.createElement("input");
    input.classList.add('answer-input');
    input.value = currentContent;
    const btn = document.createElement("button");
    btn.classList.add("edit");
    btn.textContent = "Сохранить";

    editForm.appendChild(input);
    editForm.appendChild(btn);
    contentElement.style.display = 'none';

    const editButton = editForm.querySelector(".edit");
    const editInput = editForm.querySelector(".answer-input");

    editButton.addEventListener("click", async () => {
        const updatedContent = editInput.value.trim();
        const token = localStorage.getItem("token");
        try {
            await editComment(commentId, token, updatedContent);
            editForm.innerHTML = ''; 
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
