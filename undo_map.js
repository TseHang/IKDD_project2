var height = window.innerHeight;
var width = window.innerWidth;
var svg = d3.select('#container').append('svg');
var s_rate = d3.select('#container').append('svg');
var no_birth = d3.select('#container').append('svg')

var s_compare = d3.select('#container').append('svg');
var no_death = d3.select('#container').append('svg') ;

var margin = {top: 20, right: 30, bottom: 30, left: 50},
    s_width = width-350 - margin.left - margin.right,
    s_height = 250 - margin.top - margin.bottom;


s_rate
    .attr("class", "s_rate").attr("width", width ).attr("height" , 250)
    .style("display","none") 
  .append('g')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

s_compare
    .attr("class", "s_compare").attr("width", width ).attr("height" , 250)
    .style("display","none") 
  .append('g')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

no_birth.attr("width", width ).attr("height" , 250)
    .style("display","none") 
    .style('border','3px solid black')
  .append("text")
    .attr("transform" , "translate("+(width - 500) + ",200)")
    .style("font-family", "fantasy")
    .style("font-size" , 30) 
    .text("Sorry , we have no Birth-rate Data.") ;

no_death.attr("width", width ).attr("height" , 250)
    .style("display","none") 
    .style('border','3px solid black')
  .append("text")
    .attr("transform" , "translate("+(width - 500) + ",200)")
    .style("font-family", "fantasy")
    .style("font-size" , 30) 
    .text("Sorry , we have no Death-rate Data.") ;


d3.json("world-countries.json", function(data) {
      
  //把hdi2013資料input進來 => 存成 hdi2013
  d3.csv('hdi2013.csv' , function(hdi2013){
    d3.csv('Birth_rate.csv' , function(birth){
      d3.csv('Death_rate.csv' , function(death){


    var cBirth = d3.nest()
        .key(function(d){return d.Country;})
        .entries(birth); 

    var cDeath = d3.nest()
        .key(function(d){return d.Country;})
        .entries(death); 

    /* Antarctica will not shown on the map */
    var features = _.filter(data.features, function(value, key) {
      return value.properties.name != 'Antarctica';
    });

    var projection = d3.geo.mercator();
    var oldScala = projection.scale();
    var oldTranslate = projection.translate();

    var colours = ["rgb(245, 253, 254)", "#D5EAEF" , "#79B2C6" , "rgb(29, 92, 114)"] ; //藍色版
    //var colours = ["#F5F5F5", "#EEE8AA" , "#FFA500" , "#8B4500"] ; // 橘色版
    //var colours = ["#F8F8FF", "#F0FFFF" , "#C1CDCD" , "#838B8B"] ; //灰色版
        

    var heatmapColour = d3.scale.linear()
        .domain([ hdi2013[0].HDI , hdi2013[parseInt(hdi2013.length/3)].HDI , hdi2013[parseInt(hdi2013.length * 2/3)].HDI ,hdi2013[hdi2013.length - 1].HDI ])
        .range(colours);


    xy = projection.scale(oldScala * (width / oldTranslate[0] / 2) * 0.95)
      .translate([width / 2, height / 2]);
     
    path = d3.geo.path().projection(xy);

    svg.attr('width', width).attr('height', height);
    svg.selectAll('path').data(features).enter().append('svg:path')
      .attr('d', path)
      .on('mouseover', function(data) {

        d3.select(this.parentNode.appendChild(this)).transition().duration(300)
          .style({'stroke-opacity':0.7,'stroke-width':'3px','stroke':'#000000'});
      
        $("#country").text(function(){
          return " Country : "+ data.properties.name ;
        });
        $("#birth").text(function(){
          if (data.Birth == "")
            return " Birth rate : Sorry , we don't have data." ;
          else  
            return " Birth rate : "+ data.Birth + " (Births/1,000 population)";
        })
        $("#death").text(function(){
          if (data.Death == "")
            return " Death rate : Sorry , we don't have data." ;
          else  
            return "Death rate : "+ data.Death + " (Deaths/1,000 population)";
        })

       })
      .on('click' , function(data){

        jQuery("html , body").animate({ scrollTop:height  },1000)

        for ( var i = 0 ; i < cBirth.length ; i++)
        {
          if(cBirth[i].key == data.properties.name)
          {
            $(".s_rate").empty();
            $(".s_compare").empty();

            show_linechart(cBirth[i].values , cDeath[i].values) ;

            s_rate.style("display" , "block")
             .append("text")
              .attr("transform" , "translate("+(width -750) + ",20)")
              .style("font-family", "fantasy")
              .style("font-weight",900)
              .style("font-size" , 25) 
              .style("fill","#000080")
              .text( "Birth/Death-rate History" );

            /*s_compare.append("text")
              .attr("transform" , "translate("+(width - 200) + ",50)")
              .style("font-family", "fantasy")
              .style("font-size" , 20) 
              .text("( "+cBirth[i].key+" )" )*/

            no_birth.style("display" , "none")

            break ;
          }
          else
          {
            s_rate.style("display" , "none")
            no_birth.style("display" , "block")
          }
        }
        s_compare.style("display" , "block")
             .append("text")
              .attr("transform" , "translate("+(width- 650) + ",20)")
              .style("font-family", "fantasy")
              .style("font-weight",900)
              .style("font-size" , 25) 
              .style("fill" , "#000080")
              .text("The World HDI")

        show_bar(data.properties.name) ;
      })
      .on('mouseout', function(data) {
        d3.select(this).attr('fill', function(d){
          for (var i = 0 ; i < hdi2013.length ; i++)
          {
            if(hdi2013[i].Country == data.properties.name)
            {
              return heatmapColour(hdi2013[i].HDI) ;
            }
          }
        });

        d3.select(this.parentNode.appendChild(this)).transition().duration(300)
          .style({'stroke-opacity':1,'stroke-width':'1px','stroke':'white'});
            /*
            $("#country").text(function(){
              return "" ;
            });
            $("#birth").text(function(){
              return "";
            })
            $("#death").text(function(){
              return "";
            })*/

      })
      .attr('fill', function(data){ 
        for ( var i = 0 ; i < hdi2013.length ; i++)
        {
          if(hdi2013[i].Country == data.properties.name)
          {
            return heatmapColour(hdi2013[i].HDI) ;
          }
        }
        return "#000000" ;
        //return "#FFEBCD" ;
      })
      .attr('stroke', 'rgba(255,255,255,1)')
      .attr('stroke-width', 1);


      function show_linechart(b_array , d_array){

        var x = d3.scale.ordinal()
            .rangeRoundBands([0, s_width], .1);

        var y = d3.scale.linear()
            .range([s_height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(10);

        
        var line = d3.svg.line()
              .x(function(d,i) { 
                return x(d.year); //利用尺度運算資料索引，傳回x的位置
              })
              .y(function(d , i) { 
                return y(d.num); //利用尺度運算資料的值，傳回y的位置
              });

        var tArray = new Array() ;

        for ( var i = 0 ; i <18 ; i++)
        {
          var k = "a" + i ;
          k = {} ;
          tArray.push(k) ;
          tArray[i].year = 1980+i*2 ;
        }
        tArray[17].year = 2013 ;

        var h = 20 ;
         
        tArray[20 - h].num = b_array[0].y1980 ; 
        tArray[21 - h].num = b_array[0].y1982 ;
        tArray[22 - h].num = b_array[0].y1984 ;  
        tArray[23 - h].num = b_array[0].y1986 ;
        tArray[24 - h].num = b_array[0].y1988; 
        tArray[25 - h].num = b_array[0].y1990 ;
        tArray[26 - h].num = b_array[0].y1992 ;  
        tArray[27 - h].num = b_array[0].y1994 ;
        tArray[28 - h].num = b_array[0].y1996 ; 
        tArray[29 - h].num = b_array[0].y1998 ;
        tArray[30 - h].num = b_array[0].y2000 ;  
        tArray[31 - h].num = b_array[0].y2002 ;
        tArray[32 - h].num = b_array[0].y2004 ; 
        tArray[33 - h].num = b_array[0].y2006 ;
        tArray[34 - h].num = b_array[0].y2008 ;  
        tArray[35 - h].num = b_array[0].y2010 ;
        tArray[36 - h].num = b_array[0].y2012 ;  
        tArray[37 - h].num = b_array[0].y2013 ;

        ////////////////////////
        // 做Death_data 處理的部份
        var dArray = new Array() ;

        for ( var i = 0 ; i <18 ; i++)
        {
          var k = "a" + i ;
          k = {} ;
          dArray.push(k) ;
          dArray[i].year = 1980+i*2 ;
        }
        dArray[17].year = 2013 ;

        dArray[20 - h].num = d_array[0].y1980 ; 
        dArray[21 - h].num = d_array[0].y1982 ;
        dArray[22 - h].num = d_array[0].y1984 ;  
        dArray[23 - h].num = d_array[0].y1986 ;
        dArray[24 - h].num = d_array[0].y1988 ; 
        dArray[25 - h].num = d_array[0].y1990 ;
        dArray[26 - h].num = d_array[0].y1992 ;  
        dArray[27 - h].num = d_array[0].y1994 ;
        dArray[28 - h].num = d_array[0].y1996 ; 
        dArray[29 - h].num = d_array[0].y1998 ;
        dArray[30 - h].num = d_array[0].y2000 ;  
        dArray[31 - h].num = d_array[0].y2002 ;
        dArray[32 - h].num = d_array[0].y2004 ; 
        dArray[33 - h].num = d_array[0].y2006 ;
        dArray[34 - h].num = d_array[0].y2008 ;  
        dArray[35 - h].num = d_array[0].y2010 ;
        dArray[36 - h].num = d_array[0].y2012 ;  
        dArray[37 - h].num = d_array[0].y2013 ;


        x.domain(tArray.map(function(d) { return d.year ; }));
        y.domain([0, 50]);//d3.max(tArray, function(d) { return d.num; })

        s_rate.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(30," + (s_height+10) + ")")
          .call(xAxis) 
        .append("text")
          .text("Years")
          .attr("transform" , "translate("+(s_width - 15) + ",0)") ;

        s_rate.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(50,10)")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("(/1000 population)");

        //birth-line
        s_rate.append('path')
          .attr('d', line(tArray)) //將資料套用
          .attr("class" , "line_birth")
          .attr("transform", "translate(50,18)")

        //death-line
        s_rate.append('path')
          .attr('d', line(dArray)) //將資料套用
          .attr("class" , "line_death")
          .attr("transform", "translate(50,18.5)") 

        s_rate.append("text")
            .text("birth-rate").style("font-size" , 16).style("font-family", "fantasy")
            .attr("transform" , "translate("+(s_width+80)+",175)") 
        s_rate.append("rect").attr("class" , "line_icon")
            .attr("width" , 60).attr("height" , 4) 
            .attr("transform" , "translate("+(s_width+80)+",150)") 
            .attr("fill" , "DodgerBlue")

        s_rate.append("text")
            .text("death-rate").style("font-size" , 16).style("font-family", "fantasy")
            .attr("transform" , "translate("+(s_width+80)+",225)") 
        s_rate.append("rect").attr("class" , "line_icon")
            .attr("width" , 60).attr("height" , 4) 
            .attr("transform" , "translate("+(s_width+80)+",200)") 
            .attr("fill" , "red")         
 
        }

        function show_bar(country){

        var x = d3.scale.ordinal()
            .rangeRoundBands([0, s_width], .1);

        var y = d3.scale.linear()
            .range([s_height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(10);

        x.domain(hdi2013.map(function(d) { return  d.Country; }));
        y.domain([0, 1]);//d3.max(dArray, function(d) { return d.num; })

        s_compare.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(30," + (s_height+10) + ")")
          .call(xAxis) 
        .append("text")
          .text("Years")
          .attr("transform" , "translate("+(s_width - 15) + ",0)") ;

        s_compare.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(30,10)")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("(Deaths/1000 population)");


        s_compare.selectAll(".bar").data(hdi2013).enter().append("rect")
          .attr("class", "bar")
          .attr("transform", "translate(30,10)")
          .attr("x", function(d) { return x(d.Country); })
          .attr("width", (x.rangeBand()-3))
          .attr("y", function(d) { return s_height; })
          .attr("height" ,0)
        .transition()
          .duration(250)
          .delay(function(d, i) { return i * 60; })
          .attr("y", function(d) { return y(d.HDI); })
          .attr({
            "height": function(d) { return s_height - y(d.HDI); }
          });     
        }
      })
    })
    })
      /*
      var myLocation = xy([121.3997, 23.5]);
      svg.append('circle').attr('r', 15)
        .attr('fill', 'url(#tip)')
        .attr('transform', 'translate(' + myLocation[0] + ', ' + myLocation[1] + ')');
      */
  });
    
