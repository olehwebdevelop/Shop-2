const purchasePrice = document.getElementById("purchasePrice");
const cashbackResult = document.getElementById("cashbackResult");

function formatPrice(value) {
    return new Intl.NumberFormat("uk-UA").format(value);
}

function calculateCashback() {
    const price = Number(purchasePrice.value) || 0;
    const cashback = price * 0.10;

    cashbackResult.textContent = `${formatPrice(cashback)} ₴`;
}

purchasePrice.addEventListener("input", calculateCashback);

const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {
    const button = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    button.addEventListener("click", () => {
        const isActive = item.classList.contains("active");

        faqItems.forEach((faqItem) => {
            faqItem.classList.remove("active");
            faqItem.querySelector(".faq-answer").style.maxHeight = null;
        });

        if (!isActive) {
            item.classList.add("active");
            answer.style.maxHeight = `${answer.scrollHeight}px`;
        }
    });
});

calculateCashback();