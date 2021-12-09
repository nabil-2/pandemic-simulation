function getRandomNormal(mean, deviation, float) {
    let dev = Math.random()*2*deviation;
    let n = (mean-deviation) + dev
    if(n<0) return getRandomNormal(mean, deviation, float)
    if(float) {
        if(n>100) n = getRandomNormal(mean, deviation, float);
        return n/100; //probability
    }
    return Math.round(n);
}
const state = Object.freeze({
    SUGGESTED: 0,
    INFECTED: 1,
    RECOVERED: 2,
    QUARANTINED: 3,
    CARRYING: 4
});
const infectionRoot = Object.freeze({
    HOUSEHOLD: 0,
    PUBLIC: 1,
    INTENSIVECONTACT: 2,
    TRAVEL: 3
});
class apiC {
    constructor() {}
    population = 1*(10**4);
    people = [];
    updateEvents = []; //elements: [day, oldState, newState]
    groups = [ //# of group members
        this.population,    //S=0
        0,                  //I=1
        0,                  //R=2
        0,                  //Q=3
        0                   //C=4
    ];
    startInfections = 3;
    stats= [];
    infectionRoot=  [0, 0, 0, 0];
    measures = {
        lockdown: false,
        facemask: false,
        socialDistance: false,
        travelingProhibition: false
    };
    measuresPlan = [];
    probabilities = { //m=mean, d=deviation
        infection: {
            m: 55,
            d: 5
        },
        illness: {
            m: 40,
            d: 5
        },
        carrying: {
            m: 30,
            d: 5
        },
        discovery: {
            m: 80,
            d: 10
        }
    };
    values = {
        avgPublicInfections: 2,
        avgIntensiveContacts: 2,
        avgNoInHousehold: 2,
        avgInfectedTravlers: 1
    };
    overallInfections = 0;
    involvedPeople = 0;
    init() {
        this.groups[0] = this.population;
        this.forcedInfections(this.startInfections);
        this.runSimulation();        
        //console.log(this.stats);
        //console.log("infection roots: " + this.infectionRoot);
        //console.log("overall infections: " + this.overallInfections);
        //console.log("pandemic length: " + this.days + " days");
    }
    getP(p) {
        let pObj = this.probabilities[p];
        let pNo = getRandomNormal(pObj.m, pObj.d, true);
        let m = this.measures;
        if(!m.facemask && !m.socialDistance) return pNo;
        let facemask = this.checkP(getRandomNormal(90, 5, true)); //probability of wearing facemask
        let distance = this.checkP(getRandomNormal(90, 5, true)); //probability of keeping soocial distance
        switch(p) {
            case 'infection':
                if(m.facemask && facemask) pNo *= .5;
                if(m.socialDistance && distance) pNo *= .5;
                break;
            case 'illness':
                if(m.facemask && facemask) pNo *= .5;
                if(m.socialDistance && distance) pNo *= .7;
                break;
            case 'carrying':
                if(m.socialDistance && distance) pNo *= .8;
                break;
            default:
                break;

        }
        return pNo;
    }
    days = 1;
    maxDays = 500;
    runSimulation() {
        const fct = async ()=> {
            return new Promise((resolve, reject)=> {
                $(".loading span").text(this.days);
                resolve();
            });
        };
        this.applyMeasures();
        //console.log("infections on day " + this.days + ": " + this.groups[state.INFECTED]);
        this.logData(this.days);
        do {
            this.days++;
            this.applyMeasures();
            let potentialInfectors = this.groups[state.INFECTED] + this.groups[state.CARRYING];
            for(let i=0; i<potentialInfectors; i++) {
                let p = this.getP('infection');
                if(i>=this.groups[state.INFECTED]) p *= .75; //decrease possobility of infection for carrying people
                if(!this.checkP(p)) continue;
                let mean = this.values.avgPublicInfections;
                let deviation = 2;
                if(this.measures.lockdown) {
                    mean -= 1;
                    deviation -= 1;
                }
                this.infectOthers(getRandomNormal(mean, deviation, false), infectionRoot.PUBLIC);         
                deviation = 2;       
                if(this.measures.lockdown && this.checkP(getRandomNormal(85, 5, true))) deviation -= 1; //probability of obeying meeting minimization
                this.infectOthers(getRandomNormal(this.values.avgIntensiveContacts, deviation, false), infectionRoot.INTENSIVECONTACT);
            }
            if(!this.measures.travelingProhibition) this.infectedTravelIncome();
            this.eventExecuter();
            this.logData(this.days);
            //fct();
            //console.log("infections on day " + this.days + ": " + this.groups[state.INFECTED]);
        } while(this.groups[state.INFECTED] + this.groups[state.CARRYING] + this.groups[state.QUARANTINED] > 0 && this.days < 1000);
    }
    infectedTravelIncome() {
        let infectedEnters = getRandomNormal(this.values.avgInfectedTravlers, 3, false);
        this.infectionRoot[infectionRoot.TRAVEL] += infectedEnters;
        this.forcedInfections(infectedEnters);
    }
    eventExecuter() {
        let eventsToDelete = []
        this.updateEvents.forEach((el, ix, arr)=> {
            if(this.days == el[0]) {
                eventsToDelete.push(ix);
                this.changeState(el[1], el[2]);
            }
        });
        for(let i=eventsToDelete.length-1; i>=0; i--) {
            this.updateEvents.splice(eventsToDelete[i], 1);
        }
    }
    checkP(probability) {
        return Math.random() < probability;
    }
    handleDiseasProgression() {
        this.overallInfections++;
        let discovery = this.checkP(this.getP('discovery'));
        if(discovery) {
            let dayOfDiscovery = getRandomNormal(4, 3, false);
            this.updateEvents.push([
                this.days+dayOfDiscovery,
                state.INFECTED,
                state.QUARANTINED
            ]);
        }
        let oldState = state.INFECTED;
        if(discovery) oldState = state.QUARANTINED;
        let dayOfRecovery = getRandomNormal(10, 3, false);
        this.updateEvents.push([
            this.days+dayOfRecovery,
            oldState,
            state.RECOVERED
        ]);
    }
    getAvailablePerson() {
        let pState, n = this.groups[state.SUGGESTED] + this.groups[state.CARRYING];
        let rand = Math.random()*n;
        pState = rand>this.groups[state.SUGGESTED] ? state.CARRYING : state.SUGGESTED;
        if(this.groups[pState] <= 0) {
            if(pState == state.CARRYING) {
                pState = state.SUGGESTED;
            } else {
                pState = state.CARRYING;
            }
        }
        return pState;
    }
    deleteStateChange() {
        let i=this.updateEvents.length - 1;
        do {
            if(this.updateEvents[i][1] == state.CARRYING && this.updateEvents[i][2] == state.SUGGESTED) {
                this.updateEvents.splice(i, 1);
                i=1;
            }
            i--;
        } while(i != 0);
    }
    async infectOthers(amount, root) { 
        for(let i=0; i<amount; i++) {
            if(this.involvedPeople >= this.population) return;
            let pState = this.getAvailablePerson();
            if(this.groups[pState] <= 0) continue;
            if(this.checkP(this.getP('illness'))) {
                if(pState == state.CARRYING) { //delete State-Change from C to S
                    this.deleteStateChange();
                }
                this.changeState(pState, state.INFECTED);
                this.infectionRoot[root]++;
                if(root != infectionRoot.HOUSEHOLD) this.handleHousehold();
                this.involvedPeople++;
            } else if(this.checkP(this.getP('carrying'))) {
                if(pState == state.CARRYING) continue;
                this.changeState(pState, state.CARRYING);
                this.updateEvents.push([
                    this.days+getRandomNormal(1, 1, false),
                    state.CARRYING,
                    state.SUGGESTED
                ]);
            }
        }
    }
    logData(day) {
        this.stats.push({
            day: day,
            suggested: this.groups[state.SUGGESTED],
            infections: this.groups[state.INFECTED],
            recovered: this.groups[state.RECOVERED],
            quarantine: this.groups[state.QUARANTINED],
            carrying: this.groups[state.CARRYING]
        });
    }
    handleHousehold() {
        let nInHousehold = getRandomNormal(this.values.avgNoInHousehold, 2, false);
        if(this.checkP(.5)) { //known infection --> quarantine household
            for(let i=0; i<nInHousehold; i++) {
                if(this.involvedPeople >= this.population) return;
                let pState = this.getAvailablePerson();                
                if(this.groups[pState] <= 0) return;
                if(pState == state.CARRYING) this.deleteStateChange();
                this.involvedPeople++;
                this.changeState(pState, state.QUARANTINED);
                this.updateEvents.push([
                    this.days+14,
                    state.QUARANTINED,
                    state.SUGGESTED
                ]);
            }
        } else { //unknown infection
            this.infectOthers(nInHousehold, infectionRoot.HOUSEHOLD);
        }
    }
    forcedInfections(n) {
        for(let i=0; i<n; i++) {
            if(this.involvedPeople >= this.population) return;
            this.involvedPeople++;
            this.changeState(0, 1);
        }
    }
    changeState(oldState, newState) {
        this.groups[oldState]--;
        this.groups[newState]++;
        switch(newState) {
            case state.INFECTED:
                this.handleDiseasProgression();
                break;
            case state.SUGGESTED:
                if(oldState == state.QUARANTINED) this.involvedPeople--;
                break;
            default:
                break;
        }
    }
    applyMeasures() {
        let m = this.measuresPlan; //parameter: [day (int), measure (string), on/off (boolean)]
        for(let i=0; i<m.length; i++) {
            if(this.days == m[i][0]) {
                this.measures[m[i][1]] = m[i][2];
            }
        }
        console.log();
    }
    planPandemic(...measures) {
        this.measuresPlan = measures;
        console.log();
    }
}