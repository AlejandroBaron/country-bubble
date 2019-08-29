var PERCENT=0.5
var WIDTH=3400*PERCENT;
var HEIGHT=1400*PERCENT;

var MARGIN=250*PERCENT;

var TRANSITION_TIME=600;


var MARGIN=250*PERCENT;

//Elemento svg principal
var svg = d3.select("#countries").append("svg")
.attr("width", WIDTH+MARGIN)
.attr("height", HEIGHT+MARGIN)
.attr("fill","steelblue")




//Titulo del grafico
svg.append("text")
     .attr("x",MARGIN+WIDTH/2)
     .attr("y",MARGIN/2+30)
     .style("text-anchor", "middle")
     .style("font-family","Raleway")
     .style("font-size","30px")
     .style("font-weight","bolder")
     .text("Purchase power parity vs PISA Score per country");


d3.csv("datos.csv", function(data) {



//Instanciando las definiciones "defs" para hacer patrones de banderas
var defs = svg.append("defs");

data.forEach(function(d){
  d.PIB2015=+d.PIB2015*10


  //Para cada país, hago un "patron" que lleve la imagen de la bandera para cada país
  defs.append("pattern")
  .attr("id",d.Pais+"")
  .attr("height","100%")
  .attr("width","100%")
  .attr("patternContentUnits","objectBoundingBox")
  .append("image")
  .attr("height",1)
  .attr("width",1)
  .attr("preserveAspectRatio","none")
  .attr("xmlns:xlink","http://www.w3.org/1999/xlink")
  .attr("xlink:href","flags/"+d.Pais+".svg")

});



//Dominios y escalas para cada eje
domainX=d3.extent(data,function(d){return d.pisa});
domainY=d3.extent(data,function(d){return d.PIB2015}).reverse();


console.log(domainY)
var scaleX=d3.scaleLinear()
  .domain([1150,1650])
  .range([MARGIN, WIDTH]);

var scaleY=d3.scaleLinear()
  .domain([5500,0])
  .range([MARGIN, HEIGHT]);


//Construccion de los ejes
var xAxis = d3.axisBottom(scaleX).ticks(8);
var yAxis = d3.axisLeft(scaleY).ticks(6);




//Anadido de los ejes y sus etiquetas
svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0, " + (HEIGHT) +")")
  .style("font-family","Raleway")
  .style("font-size","18px")
  .call(xAxis);

svg.append("text")
     .attr("x",MARGIN+WIDTH/2)
     .attr("y",MARGIN/2+HEIGHT)
     .style("text-anchor", "middle")
     .style("font-family","Raleway")
     .text("2015 PISA Score (total sum of Science, Mathematics and Literature)");

svg.append("text")
     .attr("x",MARGIN+WIDTH/2)
     .attr("y",MARGIN/2+HEIGHT+30)
         .style("text-anchor", "middle")
         .style("font-size","18px")
         .style("font-family","Raleway")
         .text("Radius is based on Nº of nobel prizes in log scale");


svg.append("g")
  .attr("class", "y axis")
  .attr("transform", "translate("+(MARGIN)+",0 )")
  .style("font-family","Raleway")
  .style("font-size","15px")
  .call(yAxis);

svg.append("text")
       .attr("x",-HEIGHT/2-MARGIN/2-10)
       .attr("y",MARGIN/2-10)
       .style("text-anchor", "middle")
       .attr("transform","rotate(-90)")
       .style("font-family","Raleway")
       .text("2015 PPP (Purchasing Power Parity in $Billion)");





  //Grids para los ejes
   svg.append("g")
       .attr("class", "grid")
       .attr("transform", "translate(0," + (HEIGHT) + ")")
       .call(make_x_gridlines()
           .tickSize(-HEIGHT+MARGIN )
           .tickFormat("")
       )

   // add the Y gridlines
  svg.append("g")
       .attr("class", "grid")
       .attr("transform", "translate("+(MARGIN)+",0 )")
       .call(make_y_gridlines()
           .tickSize(-WIDTH+MARGIN)
           .tickFormat("")
       )



//Array que se correlaciona con si un continente es visible o no en la visualizacion
 var continentVisible={
         Africa:true,
         Asia:true,
         America:true,
         Europe:true,
         Oceania:true
 };



//Anadido de los circulos, se rellena con el patron antes definido segun el pais

var circles = svg.selectAll("circle")
.data(data)
.enter()
.append("circle")
.attr("cx",function(d){return Math.floor(Math.random()*WIDTH)})
.attr("cy",function(d){return Math.floor(Math.random()*WIDTH)})
.attr("r",1)
.attr("opacity","1")
.style("fill",function(d){return "url(#"+d.Pais+")"})
.style("stroke","black")
.style("stroke-width","3px")
.on("mouseover", handleMouseOver)
.on("mouseout", handleMouseOut)
.transition()
.duration(TRANSITION_TIME)
.attr("cx", function (d) { return scaleX(d.pisa); })
.attr("cy", function(d){return scaleY(d.PIB2015);})
.attr("r", function (d) { return Math.log(d.Nnobel)*10+10; })
;





//Anadido de controles a las checkbox de sexo y pais
d3.selectAll(".myCheckboxSex").on("change",updateSex);
d3.selectAll(".myCheckbox").on("change",update);





//Funcion para actualizar segun la seleccion de continentes
function update(){


            //Actualizacion del array continentVisible
            d3.selectAll(".myCheckbox").each(function(d){
              cb = d3.select(this);
              if(cb.property("checked")){
                continentVisible[cb.property("name")]=true
              }
              else{
                continentVisible[cb.property("name")]=false
              }
            });

            //El radio sera el valor del radio * booleano de si es visible o no, de tal forma que si no es visible valdra 0 y no se vera
            svg.selectAll("circle")
                .attr("opacity",1)
                .transition()
                .delay(10)
                .attr("r",function(d){
                    if(selectedSex["Hombres"] & selectedSex["Mujeres"]){return continentVisible[d.continent]*(Math.log(d.Nnobel)*10+10);}
                    else if (selectedSex["Hombres"]) {return continentVisible[d.continent]*(Math.log(d.Nnobelhombres)*10+10);}
                    else if (selectedSex["Mujeres"]) {if(d.Nnobelmujeres>0) return continentVisible[d.continent]*(Math.log(d.Nnobelmujeres)*10+10);}
                })
            //updateSex();
}



var selectedSex={
  Hombres:true,
  Mujeres:true
};


//Actualizacion de las posiciones segun los valores del dataset
function updateSex(){
  d3.selectAll(".myCheckboxSex").each(function(d){
    cb = d3.select(this);
    if(cb.property("checked")){
      selectedSex[cb.property("name")]=true
    }
    else{
      selectedSex[cb.property("name")]=false
    }
  });


  svg.selectAll("circle")
      .transition()
      .delay(100)
      .attr("cx",function(d){
          if(selectedSex["Hombres"] && selectedSex["Mujeres"]){return scaleX(d.pisa)}
          else if (selectedSex["Hombres"]) {return scaleX(d.pisahombres)}
          else if (selectedSex["Mujeres"]) {return scaleX(d.pisamujeres)}
      })
      .attr("r",function(d){
          if(selectedSex["Hombres"] & selectedSex["Mujeres"]){return continentVisible[d.continent]*(Math.log(d.Nnobel)*10+10);}
          else if (selectedSex["Hombres"]) {return continentVisible[d.continent]*(Math.log(d.Nnobelhombres)*10+10);}
          else if (selectedSex["Mujeres"]) {if(d.Nnobelmujeres>0) return continentVisible[d.continent]*(Math.log(d.Nnobelmujeres)*10+10);}
      })





}


var visible=true;


//Gestion de posado del cursor (cuando se entra en el circulo)

function handleMouseOver(d,i) {

           d3.select(this).attr("fill", "red");
           var rectH=120;
           var rectW=170;

           svg.append("rect").attr("id", "tr" + d.Pais + "-" + i)  // id para gestionar el rectangulo
                            .attr("rx", 6)
                            .attr("ry", 6)
                            .attr("x", d3.select(this).attr("cx")-d3.select(this).attr("r")-rectW)
                            .attr("y", d3.select(this).attr("cy")-d3.select(this).attr("r")-rectH)
                            .attr("width",rectW)
                            .attr("height",rectH)
                            .style("stroke","black")
                            .style("stroke-width","3px")
                            .attr("fill","grey")
                            .attr("opacity",0.9);


          var textshiftX=5;
          var textshiftY=20;

          gr=svg.append("g").attr("id", "t" + d.Pais + "-" + i) // id para gestionar el texto
          gr.append("text").attr("x", d3.select(this).attr("cx")-d3.select(this).attr("r")-rectW+textshiftX)
          .attr("y", d3.select(this).attr("cy")-d3.select(this).attr("r")-rectH+textshiftY)
          .attr("pointer-events","none")
          .style("fill","white")
          .style("font-family","Raleway")
          .text(function() {
                  return d.Pais;
            });


          textshiftY+=30;
          gr.append("text").attr("x", d3.select(this).attr("cx")-d3.select(this).attr("r")-rectW+textshiftX)
          .attr("y", d3.select(this).attr("cy")-d3.select(this).attr("r")-rectH+textshiftY)
          .attr("pointer-events","none")
          .style("fill","white")
          .style("font-family","Raleway")
          .text("PISA:"+Math.floor(scaleX.invert(d3.select(this).attr("cx"))*100)/100+"pts.");  // Invertir la posicion svg para obtener el valor (y texto) real


          textshiftY+=30;
          gr.append("text").attr("x", d3.select(this).attr("cx")-d3.select(this).attr("r")-rectW+textshiftX)
          .attr("y", d3.select(this).attr("cy")-d3.select(this).attr("r")-rectH+textshiftY)
          .attr("pointer-events","none")
          .style("fill","white")
          .style("font-family","Raleway")
          .text("PPP: "+Math.floor(scaleY.invert(d3.select(this).attr("cy"))*100)/100)+" B";

          textshiftY+=30;
          gr.append("text").attr("x", d3.select(this).attr("cx")-d3.select(this).attr("r")-rectW+textshiftX)
          .attr("y", d3.select(this).attr("cy")-d3.select(this).attr("r")-rectH+textshiftY)
          .attr("pointer-events","none")
          .style("fill","white")
          .style("font-family","Raleway")
          .text("Nº Nobel: "+Math.floor(Math.exp((d3.select(this).attr("r")-10)/10)));



          //Cambiamos la opacidad del circulo cuando se posa el cursor
          if(d3.select(this).attr("opacity")==1){
                visible=!visible
                svg.selectAll("circle").attr("opacity",function(d){
                  return continentVisible[d.continent]*0.1})

                d3.select(this).attr("opacity","1")
          }

}




//Gestion de posado del cursor (cuando se sale en el circulo)
function handleMouseOut(d,i) {
           // Use D3 to select element, change color back to normal
           d3.select(this).attr("fill","green");
           d3.select("#t" + d.Pais + "-" + i).remove();
           d3.select("#tr" + d.Pais + "-" + i).remove();


           if(d3.select(this).attr("opacity")==1){
                 visible=!visible
                 svg.selectAll("circle").attr("opacity",function(d){
                   return continentVisible[d.continent]*Number(visible)})
                 d3.select(this).attr("opacity","1")
           }
}


// gridlines in x axis function
function make_x_gridlines() {
    return d3.axisBottom(scaleX)
        .ticks(8)
}

// gridlines in y axis function
function make_y_gridlines() {
    return d3.axisLeft(scaleY)
  }

});
