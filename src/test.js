MathView.load();

var TEST_ID = 1;

var testInput;

/*window.addEventListener("DOMContentLoaded", function() {
});*/

window.addEventListener("load", function() {
    testInput = document.getElementById("test");
    var mathOut = MathView.createMathView(TEST_ID, testInput);
    document.body.appendChild(mathOut);
    MathView.updateMath(TEST_ID, testInput.value);
})