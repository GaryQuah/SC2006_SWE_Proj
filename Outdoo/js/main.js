async function getUV(){
    const uv_url = "https://api-open.data.gov.sg/v2/real-time/api/uv";
    try{
        const res = await fetch(uv_url);
        const data = await res.json();
        if(!res.ok){
            throw new Error("Error");
        }
        return data.data.records[0].index[0].value;
    }
    catch(error){
        return "error";
    }
}

async function getWeather(){
    const weatherURL = "https://api-open.data.gov.sg/v2/real-time/api/air-temperature"
    try{
        const res = await fetch(weatherURL);
        const data = await res.json();
        if(!res.ok){
            throw new Error("Error");
        }
        return Math.round(data.data.readings[0].data[0].value);
    }
    catch(error){
        return "error";
    }
}

function populateActivites(){
    const activitydata = {
        "Morning Run" : "6:00AM",
        "Yoga Session" : "7:30AM",
        "Evening Walk" : "6:00AM",
        "Morning Run1" : "6:00AM",
        "Yoga Session1" : "7:30AM",
        "Evening Walk1" : "6:00AM",
        "Morning Run2" : "6:00AM",
        "Yoga Session2" : "7:30AM",
        "Evening Walk2" : "6:00AM",
        "Morning Run3" : "6:00AM",
        "Yoga Session3" : "7:30AM",
        "Evening Walk3" : "6:00AM"
    }

    for(key in activitydata){
        const activity = document.querySelector(".activity-log");
        const newdiv = document.createElement("DIV");
        newdiv.className = "activities";
        const newp1 = document.createElement("P");
        const newp2 = document.createElement("P");
        newp1.innerText = key;
        newp2.innerText = activitydata[key];

        newdiv.appendChild(newp1);
        newdiv.appendChild(newp2);
        activity.appendChild(newdiv);
    }
    
}

async function getUserPoint(){
    const userPoint = 1200;
    return userPoint;
}

getWeather().then(data =>{
    document.getElementById('weather-temperature').textContent = data + '°C';
});

getUV().then(data =>{
    document.getElementById('uv-index').textContent = data;
});

getUserPoint().then(data =>{
    document.getElementById('user-point').textContent = data;
});

populateActivites();