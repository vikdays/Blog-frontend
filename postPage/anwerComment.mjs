import { postComment } from './comments.mjs';
export function answerButtonClick(commentElement, parentId) {
    const existingAnswerForm = commentElement.querySelector(".answer-form");

    // Если форма уже существует, удаляем её
    if (existingAnswerForm) {
        existingAnswerForm.remove();
        return;
    }
    const answerForm = document.createElement("div");
    answerForm.classList.add("answer-form");

    answerForm.innerHTML = `
        <input type='text' class="answer-input" placeholder="Оставьте комментарий..."></input>
        <button class = "send">Отправить</button>
    `;

    commentElement.appendChild(answerForm);

    const sendButton = answerForm.querySelector(".send");
    const answerInput = answerForm.querySelector(".answer-input");

    sendButton.addEventListener("click", async () => {
        const content = answerInput.value.trim();
        if (!content) {
            alert("Комментарий не может быть пустым!");
            return;
        }

        const token = localStorage.getItem("token");
        const postId = localStorage.getItem("postId");
        const data = { content, parentId };

        try {
            await postComment(data, postId, token);
            window.location.reload();
        } catch (error) {
            console.error("Ошибка при отправке комментария:", error.message);
        }
    });
}
