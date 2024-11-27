import { answerButtonClick } from './anwerComment.mjs';
export async function renderCommentsChain(commentId, container = null) {
    if (!container) {
        container = document.createElement("div");
        container.classList.add("nested-comments");
    }

    const nestedComments = await getCommentChain(commentId);
    if (!nestedComments || nestedComments.length === 0) {
        console.log(`Для комментария ${commentId} нет вложенных комментариев.`);
        return container;
    }

    nestedComments.forEach(comment => {
        const commentElement = document.createElement("div");
        commentElement.classList.add("nested-comment");

        commentElement.innerHTML = `
            <div class="pretitle">${comment.author ? comment.author : '[Комментарий удален]'}</div>
            <div class="content">${comment.content ? comment.content : '[Комментарий удален]'}
                <span class="modified-date">${comment.modifiedDate ? "(изменен)" : ""}</span>
            </div>
            <div class="pretitle">${new Date(comment.createTime).toLocaleString()}
            </div>
        `;
        if (!comment.deleteDate) {
            const replyButton = document.createElement("button");
            replyButton.textContent = "Ответить";
            replyButton.classList.add("answer");
            replyButton.setAttribute("data-id", comment.id);
            commentElement.querySelector(".pretitle:last-child").appendChild(replyButton);

            replyButton.addEventListener("click", () => answerButtonClick(commentElement, comment.id));
        }

        container.appendChild(commentElement);
    });

    return container;
}

export async function getCommentChain(commentId) {
    const response = await fetch(`https://blog.kreosoft.space/api/comment/${commentId}/tree`, {
        method: "GET",
        headers: {
            'accept': 'application/json',
        },
    });

    if (!response.ok) { 
        const errorText = await response.text();
        console.error("Ошибка при получении вложенных комментариев. Статус:", response.status, "Ответ:", errorText);
        return false;
    }
    const data = await response.json();
    return data;

}