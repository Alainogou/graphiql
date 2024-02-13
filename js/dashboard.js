document.addEventListener('DOMContentLoaded', (event) => {
    let jwtToken = localStorage.getItem('jwtToken');
    
    
    if (!jwtToken) {
        window.location.href="/index.html"
          
    }else{
       
        fetchUserData()
        .then(userData => {
          generateMainContent(userData)
        
            
          let log=document.querySelector("#logout")
          if (log){
                log.addEventListener("click", ()=>{
                    localStorage.removeItem('jwtToken')
                    window.location.href="/index.html"            
                })
            
          }
           
          
        })
        .catch(error => {
            console.error(error);
            
        });
        
       
    }

})




 function fetchUserData() {
  const jwtToken = localStorage.getItem('jwtToken');

  return new Promise((resolve, reject) => {
      if (jwtToken) {
          const query = `
              query {
                
                  totalXp: transaction_aggregate (where: {type:{_eq:"xp"}, event:{object:{type:{_eq:"module"}}}}){ 
                    aggregate{
                      sum{
                        amount
                      }
                    }
                  }
                
                  user {
                      login
                      email
                      campus
                      lastName
                      firstName
                      auditRatio
                      totalUp
                      totalDown

                      skills:transactions (
                          order_by: [{ type: desc }, { amount: desc }]
                          distinct_on: [type]
                          where: { 
                              type: { _like: "skill_%" }
                          },
                      ) { 
                          type
                          amount 
                      }

                      auditFail: audits_aggregate(
                        where: {
                          grade: { _is_null: false, _lt:1},
                      
                        }
                      ) {
                        aggregate{
                          count
                        }
                      }
                      
                      auditPass: audits_aggregate(
                        where: {
                          grade: { _is_null: false, _gte:1}
                      
                        }
                      ) {
                        aggregate{
                          count
                        }
                      }
                      
                  }


                  level: transaction(
                    order_by:{amount:desc}
                      limit:1
                      where: {
                        type: { _eq: "level" },
                        _or:{event:{object:{name:{_eq:"Div 01"}}}}
                      }
                      ) {
                      amount 
                  }
              }
          `;

          // Effectuez la requête GraphQL avec le token JWT
          fetch('https://learn.zone01dakar.sn/api/graphql-engine/v1/graphql', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${jwtToken}`
              },
              body: JSON.stringify({ query: query })
          })
          .then(response => response.json())
          .then(data => {
              resolve(data.data);
              console.log(data.data.user[0].skills)
          })
          .catch(error => {
              reject('Erreur lors de la requête GraphQL: ' + error);
          });
      } else {
          reject('Aucun token JWT trouvé dans le localStorage');
      }
  });
}




 function generateMainContent(userData) {
    
    let content= `
      <div id="main">
          <div class="head">
              <div class="col-div-6">
                  <span style="font-size:30px;cursor:pointer; color: white;" class="nav">☰ GraphQl</span>
              </div>
              <div style=" float: right;">
                  <button class="hidden" id="logout">Logout</button>
              </div>
              <div class="clearfix"></div>
          </div>
          <div class="Welcome">
              <h1>Welcome, ${userData.user[0].firstName} ${userData.user[0].lastName} </h1>
          </div>
          <div class="clearfix"></div>
          <br/>
          <div class="col-div-3">
              <div class="box">
                  <i class="fa fa-users box-icon"></i>    
                  <p>${userData.user[0].login} <br/><span>User Profil</span></p>
              </div>
          </div>
          <div class="col-div-3">
              <div class="box">
                  <i class="fa fa-list box-icon"></i>
                  <p>${(userData.totalXp.aggregate.sum.amount/1000).toFixed(0)}<br/><span>Total XP</span></p>
              </div>
          </div>
          <div class="col-div-3">
              <div class="box">
                  <i class="fa-solid fa-podcast box-icon"></i>
                  <div style="display: inline-block;">
                      <div>
                          <span class="audit-up" style="color: aliceblue;">${(userData.user[0].totalUp/1000000).toFixed(2)} <i class="fa-solid fa-up-long" style="color: #0a64ff;"></i> </span>
                      </div>
                      <div>
                          <span class="audit-down"  style="color: aliceblue;">${(userData.user[0].totalDown/1000000).toFixed(2)}<i class="fa-solid fa-down-long" style="color: #ffc800;"></i> </span>
                      </div>
                  </div> 
                  <p>${(userData.user[0].auditRatio).toFixed(1)}<br/><span>Audits ratio</span></p>
              </div>
          </div>
          <div class="col-div-3">
              <div class="box" >
                  <i class="fa-solid fa-turn-up box-icon"></i>
                  <p>${userData.level[0].amount}<br/><span>Level</span></p>
              </div>
          </div>
          <div class="clearfix"></div>
          <br/><br/>

          <div class="diagramme">
          <div class="col-div-8">
              <div class="box-8">
                  <div class="content-box">
                      <p>Best skills <span></span></p>
                      ${generateBarChart(userData.user[0].skills)}
                      <br/>	
                  </div>    
              </div>
          </div>
      
          <div class="col-div-4">
              <div class="box-4">
                  <div class="content-box">
                      <p>Audits<span></span></p>
                      ${createPieChart(userData.user[0].auditFail.aggregate.count, userData.user[0].auditPass.aggregate.count)}
                  </div>
              </div>
          </div>
         </div>
      
        </div>
  `;

  document.body.innerHTML=content
}




function generateBarChart(skillsData) {
   
    const svgWidth = 800;
    const svgHeight = 600;
    const barWidth = 50;
    const maxHeight = 500;

    let svg = '<svg width="' + svgWidth + '" height="' + svgHeight + '">';

    // Axe des ordonnées (pourcentages)
    svg += '<line x1="50" y1="50" x2="50" y2="' + (svgHeight - 50) + '" stroke="white" stroke-width="2"/>';
    for (let i = 0; i <= 10; i++) {
        let y = svgHeight - 50 - (i * ((svgHeight - 100) / 10));
        svg += '<text x="30" y="' + y + '" fill="white">' + (i * 10) + '</text>';
    }

    // Axe des abscisses (compétences)
    svg += '<text x="' + (svgWidth - 50) + '" y="' + (svgHeight - 10) + '" fill="white"></text>';
    svg += '<line x1="50" y1="' + (svgHeight - 50) + '" x2="' + (svgWidth - 50) + '" y2="' + (svgHeight - 50) + '" stroke="white" stroke-width="2"/>'; 

    let xPosition = 100;
    for (let skill of skillsData) {
        svg += '<text x="' + (xPosition + 10) + '" y="' + (svgHeight - 30) + '" fill="white" transform="rotate(20 ' + (xPosition + 10) + ',' + (svgHeight - 30) + ')">' + skill.type.substring(6) + '</text>';
        xPosition += (barWidth + 20);
        
    }

    // Création des barres
    xPosition = 100;
    for (let skill of skillsData) {
        let percentage = (skill.amount / 100) * 100;
        let barHeight = (percentage / 100) * maxHeight;
        let yPosition = svgHeight - barHeight - 50;
        svg += '<rect x="' + xPosition + '" y="' + yPosition + '" width="' + barWidth + '" height="' + barHeight + '" fill="blue" onmouseover="showSkillName(\'' + skill.type.substring(6) + '\', \'' + skill.amount + '\')" onmouseout="hideSkillName()"/>';
        xPosition += (barWidth + 20);
    }

    svg += '</svg>';

    window.showSkillName = function (skillName, amount) {
        let tooltip = document.createElement('div');
        tooltip.innerHTML = skillName + ': ' + amount;
        tooltip.style.position = 'absolute';
        tooltip.style.left = (event.pageX + 10) + 'px';
        tooltip.style.top = (event.pageY + 10) + 'px';
        tooltip.style.background = 'rgba(0, 0, 0, 0.7)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '5px';
        tooltip.id = 'tooltip';
        document.body.appendChild(tooltip);
    };

    window.hideSkillName = function () {
        let tooltip = document.getElementById('tooltip');
        if (tooltip) {
            tooltip.parentNode.removeChild(tooltip);
        }
    };

    return svg;
}

function createPieChart(auditFail, auditPass) {
    const totalAudits = auditFail + auditPass;
    const failPercentage = (auditFail / totalAudits) * 100;
    const passPercentage = (auditPass / totalAudits) * 100;

    const svgWidth = 300;
    const svgHeight = 300;
    const radius = Math.min(svgWidth, svgHeight) / 2;

    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;

    const failColor = "red";
    const passColor = "green";

    const failEndAngle = (failPercentage / 100) * Math.PI * 2;
    const passEndAngle = (passPercentage / 100) * Math.PI * 2;

    const largeArcFlagFail = failPercentage > 50 ? 1 : 0;
    const largeArcFlagPass = passPercentage > 50 ? 1 : 0;

    const failX1 = centerX + radius * Math.sin(0);
    const failY1 = centerY - radius * Math.cos(0);
    const failX2 = centerX + radius * Math.sin(failEndAngle);
    const failY2 = centerY - radius * Math.cos(failEndAngle);

    const passX1 = centerX + radius * Math.sin(failEndAngle);
    const passY1 = centerY - radius * Math.cos(failEndAngle);
    const passX2 = centerX + radius * Math.sin(failEndAngle + passEndAngle);
    const passY2 = centerY - radius * Math.cos(failEndAngle + passEndAngle);

    const failPercentageTextX = centerX + (radius / 2) * Math.cos(failEndAngle / 2);
    const failPercentageTextY = centerY + (radius / 2) * Math.sin(failEndAngle / 2);
    const passPercentageTextX = centerX + (radius / 2) * Math.cos(failEndAngle + passEndAngle / 2);
    const passPercentageTextY = centerY + (radius / 2) * Math.sin(failEndAngle + passEndAngle / 2);

    const svg = `
        <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
            <path d="M ${centerX},${centerY} L ${failX1},${failY1} A ${radius},${radius} 0 ${largeArcFlagFail},1 ${failX2},${failY2} Z" fill="${failColor}">
                <title>${failPercentage.toFixed(2)}%</title>
            </path>
            <path d="M ${centerX},${centerY} L ${passX1},${passY1} A ${radius},${radius} 0 ${largeArcFlagPass},1 ${passX2},${passY2} Z" fill="${passColor}">
                <title>${passPercentage.toFixed(2)}%</title>
            </path>
            
        </svg>
    `;

    return svg;
}


