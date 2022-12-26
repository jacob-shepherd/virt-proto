const cancelBtn = document.getElementById('cancel')
const info = document.getElementById('info')
const confirm = document.getElementById('confirm')

cancelBtn.addEventListener("click", () => {
    cancelBtn.classList.add('none')
    info.classList.remove('none')
    confirm.classList.remove('none')
})