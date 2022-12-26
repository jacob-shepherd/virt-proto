const form = document.getElementById('form')
const submit = document.getElementById('submit')
const type = document.getElementById('type')
const cNum = document.getElementById('c_num')

type.addEventListener("change", () => {
    console.log(type.value)
    if(type.value === 'American-Express'){
        num = cNum.value
        cNum.value = num.replace(/(\d{4})(\d{6})(\d{5})/, "$1-$2-$3")
        console.log(num.replace(/(\d{4})(\d{6})(\d{5})/, "$1-$2-$3"))
    }else{
    num = cNum.value
    cNum.value = num.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, "$1-$2-$3-$4")
    console.log(num.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, "$1-$2-$3-$4"))
}})


cNum.addEventListener("change", () => {
    if(type.value === 'American-Express'){
        console.log(type.value)
        num = cNum.value
        cNum.value = num.replace(/(\d{4})(\d{6})(\d{5})/, "$1-$2-$3")
        console.log(num.replace(/(\d{4})(\d{6})(\d{5})/, "$1-$2-$3"))
    }else{
    num = cNum.value
    cNum.value = num.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, "$1-$2-$3-$4")
    console.log(num.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, "$1-$2-$3-$4"))
}})