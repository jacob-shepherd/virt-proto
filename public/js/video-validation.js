

    const invalid = document.getElementById('invalid')
    const valid = document.getElementById('valid')
    
    function validateUpload() {
        const upload = document.getElementById('file')
    
        const fileName = upload.value
    
        //allowed file types
    
        const allowedFileTypes =  /(\.mp4)$/i;
    
        if (!allowedFileTypes.exec(fileName)) {
                    invalid.innerText = "invalid file type!"
                    valid.innerText = ""
                    upload.value = '';
                }else{
                    invalid.innerText = ""
                    valid.innerText = "good!"
                }
    }
    
    function hidePrompt() {
        invalid.innerText = ""
        valid.innerText = ""
    }
    
function validation() {
    upload.addListenerEvent('click', e => {
        onchange() 
        return validateUpload
    })
}
