/**
 * Filter in plain HTML
 * Usefull for iphone
 *
 * Compile all filter into a function and then run it!
 * @author  Pierre-Loic Doulcet
 * 
 * The MIT License (MIT)

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
 */

function CanvasFilters() {

  var ctx = null;
  var imageData = null;
  var imageDataOri = null;
  var data = null;
  var oriData = null;
  var WIDTH = 0;
  var HEIGHT = 0;

  var filtersStack = "";

  this.texture = function(textureContext, width, height) {
    ctx = textureContext;
    WIDTH = width;
    HEIGHT = height;
    imageData = ctx.getImageData(0,0,width, height);
    data = imageData.data;
    // Android Fix
    if (!window.Uint8ClampedArray) {
      imageDataOri = ctx.getImageData(0,0,width, height);
      oriData = imageDataOri.data;
    }
  };


  this.update = function()
  {   
    // console.log(fn);
    var start = Date.now();
    
    var init = "var d = data; var originalData; if (window.Uint8ClampedArray) {originalData = new Uint8ClampedArray(data)} else { originalData = oriData};var average = 0;var temp = 0; var temp2=0;var temp3=0; var temp4 = 0;var R = 0; var G = 0; var B = 0;var AR = 0;var AG = 0;var AB = 0;\
    var x = 1.0;\
    var y = 1.0;\
    var xp = 1.0 / WIDTH;\
    var yp = 1.0 / HEIGHT;\
    var XP = WIDTH - 1;\
    var YP = HEIGHT - 1;\
    while (i-- > 0) {\
      var index = i * 4;\
      var r = originalData[index] / 255;\
      var g = originalData[index + 1] / 255;\
      var b = originalData[index + 2] / 255;";

    var result =  "\
      d[index] = r * 255;\
      d[index + 1] = g * 255;\
      d[index + 2] = b * 255;\
      x = x - xp;\
      if (x < 0) {y = y - yp; x= 1.0};\
      XP--;\
      if (XP < 0) {\
        XP = WIDTH - 1;\
        YP--;\
      }\
    }return d;";

   // console.log( init + filtersStack + result);

    var fn = new Function('data', 'oriData', 'i', 'WIDTH', 'HEIGHT', init + filtersStack + result);

    var d = data;
    var i = WIDTH * HEIGHT;
    d = fn(d, oriData, i, WIDTH, HEIGHT);
    imageData.data = d;
    var end = Date.now();
  //  ddd('Run Time', end - start, i);
    ctx.putImageData(imageData, 0,0);
  };


  this.brightness = function(brightness)
  {
    filtersStack += "r += " + brightness + " ;g += " + brightness + ";b += " + brightness + ";";
  };

  this.contrast = function(contrast) {
    if (contrast > 0) {
      filtersStack += "r = (r - 0.5) / " + (1.0 - contrast) + " + 0.5;";
      filtersStack += "g = (g - 0.5) / " + (1.0 - contrast) + " + 0.5;";
      filtersStack += "b = (b - 0.5) / " + (1.0 - contrast) + " + 0.5;";
    }
    else {
      filtersStack += "r = (r - 0.5) * " + (1.0 + contrast) + " + 0.5;";
      filtersStack += "g = (g - 0.5) * " + (1.0 + contrast) + " + 0.5;";
      filtersStack += "b = (b - 0.5) * " + (1.0 + contrast) + " + 0.5;";
    }   
  };

  this.hue = function(hue) {
    var angle = hue * Math.PI;
    var s = Math.sin(angle);
    var c = Math.cos(angle);
    var rw = (2.0 * c + 1.0) / 3.0;
    var gw = (-Math.sqrt(3.0) * s - c + 1.0) / 3.0;
    var bw = (Math.sqrt(3.0) * s - c + 1.0) / 3.0;
    filtersStack += "R = r; G = g; B = b;";
    filtersStack += "r = R * " + rw + "+ G * " + gw + " + B * " + bw + ";";
    filtersStack += "g = R * " + bw + "+ G * " + rw + " + B * " + gw + ";";
    filtersStack += "b = R * " + gw + "+ G * " + bw + " + B * " + rw + ";";
  }

  this.saturation = function(saturation) {
    filtersStack += "average = (r + g + b) / 3.0;";

    if (saturation > 0.0) {
       filtersStack += "r += (average - r) * (1.0 - 1.0 / (1.001 - " + saturation + "));";
       filtersStack += "g += (average - g) * (1.0 - 1.0 / (1.001 - " + saturation + "));";
       filtersStack += "b += (average - b) * (1.0 - 1.0 / (1.001 - " + saturation + "));";
      }
      else {
        filtersStack += "r += (average - r) * " + (-saturation) + ";";
        filtersStack += "g += (average - g) * " + (-saturation) + ";";
        filtersStack += "b += (average - b) * " + (-saturation) + ";";
      }
  }
  

  this.sepia = function(amount) {
    filtersStack += "R = r; G = g; B = b;";
    filtersStack += "r = (R * (1.0 - (0.607 * " + amount + "))) + (G * (0.769 * " + amount + ")) + (B * (0.189 * " + amount + "));";
    filtersStack += "g = (R * 0.349 * " + amount + ") + (G * (1.0 - (0.314 * " + amount + "))) + (B * 0.168 * " + amount + ");";
    filtersStack += "b = (R * 0.272 * " + amount + ") + (G * 0.534 * " + amount + ") + (B * (1.0 - (0.869 * " + amount + ")));";
  };

  this.invertColor = function() {
    filtersStack += "r = 1.0 - r;";
    filtersStack += "g = 1.0 - g;";
    filtersStack += "b = 1.0 - b;";
  };

  this.mirror = function() {
    var d = data;
    var x = 0;
    while (x < WIDTH / 2) {
      var y  = 0;
      while (y < HEIGHT) {
        var i = x + WIDTH * y;
        var j = WIDTH - x + WIDTH * y;
        var r = d[i * 4];
        var g = d[i * 4 + 1];
        var b = d[i * 4 + 2];
        
        d[i * 4] = d[j * 4];
        d[i * 4 + 1] = d[j * 4 + 1];
        d[i * 4 + 2] = d[j * 4 + 2];

        d[j * 4] = r ;
        d[j * 4 + 1] = g;
        d[j * 4 + 2] = b;

        ++y;
      }
      ++x;
    }
  
  };

  this.vignette = function(size, amount, X, Y, R, G, B) {

    R  = R / 255;
    G  = G / 255;
    B  = B / 255;
    
    filtersStack += "average = Math.sqrt((x - " + X + ") * (x - " + X + ") + (y - " + Y + ") * (y - " + Y + "));";
    filtersStack += "temp = 1.6 - average - (" + amount + " + " + size + " * 0.799);";
    filtersStack += "if (temp <= 1.0) {";
      filtersStack += "r = r * temp + (1.0 - temp) * " + R + ";";
      filtersStack += "g = g * temp + (1.0 - temp) * " + G + ";";
      filtersStack += "b = b * temp + (1.0 - temp) * " + B + ";";
    filtersStack += "};"
  }

  this.color = function(A, R, G, B) {
    filtersStack += " r += " + (R * A) + ";";
    filtersStack += " g += " + (G * A) + ";";
    filtersStack += " b += " + (B * A) + ";";
  }


  this.noise = function(amount) {
    
    filtersStack += "temp = (Math.random() - 0.5) * " + amount + ";";
    filtersStack += " r += temp;";
    filtersStack += " g += temp;";
    filtersStack += " b += temp;";
  }


  this.gamma = function(gamma) {
    filtersStack += " r = Math.pow(r, " + gamma + ");";
    filtersStack += " g = Math.pow(g, " + gamma + ");";
    filtersStack += " b = Math.pow(b, " + gamma + ");";
  }

  this.exposure = function(exposure) {
    var e = Math.pow(2.0, exposure);
    filtersStack += " r = r * " + e + ";";
    filtersStack += " g = g * " + e + ";";
    filtersStack += " b = b * " + e + ";";
  }

  this.threshold = function(threshold, A, R1, G1, B1, R2, G2, B2) {
    R1 = R1 / 255;
    G1 = G1 / 255;
    B1 = B1 / 255;
    R2 = R2 / 255;
    G2 = G2 / 255;
    B2 = B2 / 255;
   
    filtersStack += "average = (r + g + b) / 3.0;";
    filtersStack += " if (average < " + threshold + ") {";
      filtersStack += "r = " + R1 + " + (1.0 - " + A + ") * r;";
      filtersStack += "g = " + G1 + " + (1.0 - " + A + ") * g;";
      filtersStack += "b = " + B1 + " + (1.0 - " + A + ") * b;";
    filtersStack += "} else {";
      filtersStack += "r = " + A + " * " + R2 + " + (1.0 - " + A + ") * r;";
      filtersStack += "g = " + A + " * " + G2 + " + (1.0 - " + A + ") * g;";
      filtersStack += "b = " + A + " * " + B2 + " + (1.0 - " + A + ") * b;";
    filtersStack += "};";
  }


  this.denoiseCompute = function(x, y, amount) {
      filtersStack +=  'if (XP + ' + x + ' > 0 && XP + ' + x +' < WIDTH && YP + ' + y + ' > 0 && YP + ' + y + ' < HEIGHT) {\
        temp2 = (XP + ' + x + ' + (YP + ' + y +') * WIDTH) * 4;\
        R = originalData[temp2] / 255;\
        G = originalData[temp2 + 1] / 255;\
        B = originalData[temp2 + 2] / 255;\
        var weight = 1.0 - Math.abs((R - r) * 0.25 + (G - g) * 0.25 + (B - b) * 0.25);\
        weight = Math.pow(weight, ' + amount + ');\
        AR += R * weight;\
        AG += G * weight;\
        AB += B * weight;\
        temp += weight;\
      }';
  } 
  this.denoise = function(amount) {
    //filtersStack += 'temp = 0; AR = 0; AG = 0; AB = 0;';
    
    //for (var i = -1; i < 1; ++i) {
     // for (var j = -1;j < 1; ++j) {
      //   this.denoiseCompute(i, j, amount);
     // }
    //}
    
    //filtersStack += 'r = AR / temp;\
     // g = AG / temp;\
     // b = AB / temp;';
  };

  this.computeInk = function(x, y) {
      filtersStack +=  'if (XP + ' + x + ' > 0 && XP + ' + x +' < WIDTH && YP + ' + y + ' > 0 && YP + ' + y + ' < HEIGHT) {\
        temp3 = (XP + ' + x + ' + (YP + ' + y +') * WIDTH) * 4;\
        temp += 1.0;\
        R += originalData[temp3];\
        G += originalData[temp3 + 1];\
        B += originalData[temp3 + 2];';

      if (Math.abs(x) + Math.abs(y) < 2.0) {
        filtersStack += 'temp2 += 1.0;\
        AR += originalData[temp3];\
        AG += originalData[temp3 + 1];\
        AB += originalData[temp3 + 2];';
      }

      filtersStack += '}';
  };

  this.ink = function(amount) {
    filtersStack += 'temp = 0; temp2 = 0; AR = 0; AG = 0; AB = 0; R = 0; G = 0; B = 0;';
    
    for (var i = -2.0; i <= 2.0; i++) {
      for (var j = -2.0;j <= 2.0; j++) {
        if (Math.abs(i) + Math.abs(j) < 2.0 || Math.abs(i) + Math.abs(j) > 3.0)
          this.computeInk(i, j);
      }
    }

    amount = amount / 4 ;
    amount = amount * amount * amount * amount * amount * 392.156; // 39.2156 -> 100000 / 255

    filtersStack += '\
        R = Math.max(0.0, R / temp - AR / temp2);\
        G = Math.max(0.0, G / temp - AG / temp2);\
        B = Math.max(0.0, B / temp - AB / temp2);\
      temp = R * R + G * G + B * B;\
      r -= temp * ' + amount + ';\
      g -= temp * ' + amount + ';\
      b -= temp * ' + amount + ';\
    ';
  };


  this.colorHalftone = function(centerX, centerY, angle, size, min, max) {
    filtersStack += 'temp3 = ' + (Math.PI / size) + ';\
      temp2 = Math.max(r, Math.max(g, b)) - Math.min(r, Math.min(g, b));\
      if (temp2 > ' + min + ') {\
        temp = 0;\
        if (temp2 < 0.058823 | (r < 0.372549) | (g < 0.156862) | (b < 0.078431) | (r < g) | (r < b)) {\
          temp = 1;\
        }\
        else {\
          temp2 = r-g;\
          if (-0.058823 <  temp2 && temp2 < 0.058823) {\
            temp = 1;\
          }\
        }\
        if (temp) {\
          R = 1.0 - r;\
          G = 1.0 - g;\
          B = 1.0 - b;\
          temp4 = Math.min(R, Math.min(G, B));\
          R = (R - temp4) / (1.0 - temp4);\
          G = (G - temp4) / (1.0 - temp4);\
          B = (B - temp4) / (1.0 - temp4);\
          R = R * 10.0- 3.0 + (Math.sin((' + Math.cos(angle + 0.26179) + ' * XP - ' +  Math.sin(angle + 0.26179) + ' * YP) * temp3) * Math.sin((' + Math.sin(angle + 0.26179) + ' * XP + ' + Math.cos(angle + 0.26179) + ' * YP) * temp3)) * 4.0;\
          G = G * 10.0- 3.0 + (Math.sin((' + Math.cos(angle + 1.30899) + ' * XP - ' +  Math.sin(angle + 1.30899) + ' * YP) * temp3) * Math.sin((' + Math.sin(angle + 1.30899) + ' * XP + ' + Math.cos(angle + 1.30899) + ' * YP) * temp3)) * 4.0;\
          B = B * 10.0- 3.0 + (Math.sin((' + Math.cos(angle + 0) + ' * XP - ' +  Math.sin(angle + 0) + ' * YP) * temp3) * Math.sin((' + Math.sin(angle + 0) + ' * XP + ' + Math.cos(angle + 0) + ' * YP) * temp3)) * 4.0;\
          temp4 = temp4 * 10.0- 3.0 + (Math.sin((' + Math.cos(angle + 0.78539) + ' * XP - ' +  Math.sin(angle + 0.78539) + ' * YP) * temp3) * Math.sin((' + Math.sin(angle + 0.78539) + ' * XP + ' + Math.cos(angle + 0.78539) + ' * YP) * temp3)) * 4.0;\
          r = 1.0 - R - temp4;\
          g = 1.0 - G - temp4;\
          b = 1.0 - B - temp4;\
        }\
      }\
  '
  };



  this.gammaRGB = function(amplitudeR, exponentR, offsetR ,amplitudeG,exponentG, offsetG, amplitudeB,exponentB, offsetB) {
    filtersStack += " r =  " + amplitudeR + " * Math.pow(r, " + exponentR + ") + " + offsetR + ";";
    filtersStack += " g =  " + amplitudeG + " * Math.pow(g, " + exponentG + ") + " + offsetG + ";";
    filtersStack += " b =  " + amplitudeB + " * Math.pow(b, " + exponentB + ") + " + offsetB + ";";
  };

  this.gammaRGB = function() {
     filtersStack += "g += 0.5; r -= 0.4";
  };

  this.computeSobel = function(x, y, name) {
      filtersStack +=  'if (XP + ' + x + ' > 0 && XP + ' + x +' < WIDTH && YP + ' + y + ' > 0 && YP + ' + y + ' < HEIGHT) {';
      filtersStack += name + '= originalData[(XP + ' + x + ' + (YP + ' + y +') * WIDTH) * 4] / 255;';
      filtersStack += '} else {';
      filtersStack += name + '=0';
      filtersStack += '};';
  };

  this.sobel = function(secondary, coef, alpha, r, g, b, a, r2, g2, b2, a2) {
    this.computeSobel(-1, 1, 'temp1');
    this.computeSobel(1, -1, 'temp2');
    this.computeSobel(-1, -1, 'temp3');
    this.computeSobel(1, 1, 'temp4');
    this.computeSobel(-1, 0, 'R');
    this.computeSobel(1, 0, 'G');
    this.computeSobel(0, 1, 'B');
    this.computeSobel(0, -1, 'AR');

    filtersStack += 'AG = -' 
      + secondary + ' * temp3 - ' 
      + coef + ' * AR - ' 
      + secondary + ' * temp2 + '
      + secondary + ' * temp1 + ' 
      + coef + ' * B + ' 
      + secondary +' * temp4;';
    filtersStack += 'AB = -'
      + secondary + '* temp1 -'
      + coef + ' * R -'
      + secondary + '* temp3 +' 
      + secondary + '* temp4 +'
      + coef + '* G +'
      + secondary + '* temp2;';

      var al= alpha * a;
      var al2= alpha * a2;
      filtersStack += 'AG  = Math.sqrt((AG * AG + AB * AB));'
      filtersStack += 'if (AG < 0.5) {';
  
      filtersStack += 'r *= ' + (1.0 - al) + ';';
      filtersStack += 'g *= ' + (1.0 - al) + ';';
      filtersStack += 'b *= ' + (1.0 - al) + ';';

      filtersStack += 'r += ' + (r * al) + ';';
      filtersStack += 'g += ' + (g * al) + ';';
      filtersStack += 'b += ' + (b * al) + ';';
      
      filtersStack += 'r += ' + (al) + ' * AG;';
      filtersStack += 'g += ' + (al) + ' * AG;';
      filtersStack += 'b += ' + (al) + ' * AG;';
  
      filtersStack += '} else {';
  
      filtersStack += 'r *= ' + (1.0 - al2) + ';';
      filtersStack += 'g *= ' + (1.0 - al2) + ';';
      filtersStack += 'b *= ' + (1.0 - al2) + ';';

      filtersStack += 'r += ' + (r2 * al2) + ';';
      filtersStack += 'g += ' + (g2 * al2) + ';';
      filtersStack += 'b += ' + (b2 * al2) + ';';
  
      filtersStack += 'r += ' + (al2) + ' * AG;';
      filtersStack += 'g += ' + (al2) + ' * AG;';
      filtersStack += 'b += ' + (al2) + ' * AG;';

      filtersStack += '};';

  }
}