let charRNN;
var models = ["staff1","staff2","staff3"];
var vocab;
var runningInference = false;
var generatedABC = "";
var title = "eurovision-staff1-char-rnn";

var mesure = "4/4";
var tempo = 180;
var defaultValue = "1/8";
var tone = "C";

$(document).ready(function() {

  //–––––– CHAR RNN ––––––

  //#1 Generate modelList
  models.forEach((item, index) => {
    $('#modelList').append("<option value=\""+item+"\">Eurovision : "+item+"</option>");
  });

  //#2 Create the LSTM Generator
  charRNN = ml5.charRNN('./models/'+models[0]+'/', modelReady);

  //#3 Load Vocab
  $.ajax({
      cache: false,
      type: 'GET', 
      url: './models/'+models[0]+'/vocab.json',
      dataType: 'json',
      async: false,
      success: function (data) { 
          vocab = Object.keys(data);
          //console.log(vocab);
      }
  });
  
  //#4 Choose seed note
  var randomSeed = Math.floor(Math.random() * (vocab.length-1 + 1) + 0);
  vocab.forEach((item, index) => {
    if(item == vocab[randomSeed]){
      $('#textInput').append("<option value=\""+item+"\" selected>"+item+"</option>");
    } else {
      $('#textInput').append("<option value=\""+item+"\">"+item+"</option>");
    }
  });

  //More Options
  var mesureArray = ["1/2","2/2","1/4","2/4","3/4","4/4","1/8","2/8","3/8","4/8","5/8","6/8","7/8","8/8"];
  mesureArray.forEach((item, index) => {
    if(item == mesure){
      $('#mesure').append("<option value=\""+item+"\" selected>"+item+"</option>");
    } else {
      $('#mesure').append("<option value=\""+item+"\">"+item+"</option>");
    }
  });

  var defaultValueArray = ["1/2","1/4","1/8","1/16"];
  defaultValueArray.forEach((item, index) => {
    if(item == defaultValue){
      $('#default').append("<option value=\""+item+"\" selected>"+item+"</option>");
    } else {
      $('#default').append("<option value=\""+item+"\">"+item+"</option>");
    }
  });

  var toneArray = ["F","C","G","D","A","E","B","C perc"];
  toneArray.forEach((item, index) => {
    if(item == tone){
      $('#tone').append("<option value=\""+item+"\" selected>"+item+"</option>");
    } else {
      $('#tone').append("<option value=\""+item+"\">"+item+"</option>");
    }
  });

});

//–––––– Update select ––––––
$("#modelList").change(function() {
  console.log(this.value);
  //TODO reload model
  runningInference = true;
  $('#status').html('Loading…');
  charRNN = ml5.charRNN('./models/'+this.value+'/', modelReady);
  title = "eurovision-"+this.value+"-char-rnn";

  //#3 Reload Vocab
  $.ajax({
      cache: false,
      type: 'GET', 
      url: './models/'+this.value+'/vocab.json',
      dataType: 'json',
      async: false,
      success: function (data) { 
          vocab = Object.keys(data);
          //console.log(vocab);
      }
  });
  
  //#4 Re-Choose seed note
  var randomSeed = Math.floor(Math.random() * (vocab.length-1 + 1) + 0);
  $("#textInput option").remove();
  vocab.forEach((item, index) => {
    if(item == vocab[randomSeed]){
      $('#textInput').append("<option value=\""+item+"\" selected>"+item+"</option>");
    } else {
      $('#textInput').append("<option value=\""+item+"\">"+item+"</option>");
    }
  });
});

$("#mesure").change(function() {
  mesure = this.value
});

$("#default").change(function() {
  defaultValue = this.value
});

$("#tone").change(function() {
  tone = this.value
});

function modelReady() {
  $('#status').html('Model Loaded');
  runningInference = false;
}

//–––––– Update slider ––––––
$("#lenSlider").on("change mousemove", function(){
  $('#length').html(this.value);
});

$("#tempSlider").on("change mousemove", function(){
  $('#temperature').html(parseFloat(this.value).toFixed(2));
});

$("#tempoSlider").on("change mousemove", function(){
  $('#tempo').html(this.value);
  tempo = this.value;
});

$('#generate').click(function(){
  
  // Update the status log
  $(this).addClass("progress");
  $(this).html("Generating…");
  generate();
});

function generate() {
  // prevent starting inference if we've already started another instance
  if(!runningInference) {
    runningInference = true;


    // Grab the original text
    let original = $('#textInput').val();

    // Make it to lower case ?
    //let txt = original.toLowerCase();
    console.log(original);

    // Check if there's something to send
    if (original.length > 0) {
      // This is what the LSTM generator needs
      // Seed text, temperature, length to outputs
      let data = {
        seed: original,
        temperature: $("#tempSlider").val(),
        length: $("#lenSlider").val()
      };

      // Generate text with the charRNN
      charRNN.generate(data, gotData);

      // When it's done
      function gotData(err, result) {
        
        var abc_base = 
          "X: 1\n"+
          "T: "+title+"\n"+
          "M: "+mesure+"\n"+
          "L: "+defaultValue+"\n"+
          "Q: "+tempo+"\n"+
          "K: "+tone+"\n";

        generatedABC = abc_base+result.sample;
        
        console.log(generatedABC);

        ABCJS.renderAbc("paper", generatedABC,{responsive: "resize"});
        ABCJS.renderMidi("midi", generatedABC, {program: 0}, {displayLoop: true});
        ABCJS.renderMidi("midi-download", generatedABC, { generateDownload: true, generateInline: false });

        runningInference = false;

        $('#generate').removeClass("progress");
        $('#generate').html("Generate");
      }
    }
  }
}