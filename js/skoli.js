"use strict";

(
  function(exports) {

  	exports.Afangi = function(param) {
	  this.heiti = param[0];
	  this.einingar = param[1];
	  this.vm = -1;
	  this.hperweek = param[4];
	  this.lengdKest = param[5];
	  this.synid = synidaemi[param[3]];
	  this.skerding = 0;
	  this.thaettir = {};
	  
	  this.actualFjoldi = param[2];
	  this.fjoldi = Math.max(param[2],this.synid.lagmark);
	  if (this.synid.heiti === 'Starfsbraut (1/3)' || this.synid.heiti === 'Starfsbraut (4/6)' || this.synid.heiti === 'Starfsbraut (7/12)') {
	     if (this.fjoldi > this.synid.hamark_e) {
	        this.fjoldi = this.synid.hamark_e;
	     }
	  }
	};
	exports.Afangi.prototype.Fjoldi = function() {
	    return this.actualFjoldi;
	};
	exports.Afangi.prototype.hamark = function() {
	    return this.synid.hamark_n;
	};
	exports.Afangi.prototype.vinnumat = function () {
	  return this.vm;
	};
	exports.Afangi.prototype.reikna_vinnumat = function() {
	  if (this.heiti ==='' || this.einingar === '' || this.fjoldi === '') {
	    return 0;
	  }
	  var ein =parseFloat(this.einingar);
	  if (ein == 2 && (this.synid.heiti === 'Hægferð') ||ein == 2 && (this.synid.heiti === 'Hægferð') || ein == 2 && (this.synid.heiti === 'Íslenska, hægferð (gamalt)') || ein == 2 && (this.synid.heiti === 'Enska, hægferð (gamalt)')|| ein == 2 && (this.synid.heiti === 'Danska, hægferð (gamalt)')) {
	    ein +=1;
	  }
	  this.thaettir['Kennsluáætlun'] = parseFloat(this.synid.timar_namsAetlun*ein/3);
	  this.thaettir['Verkefnis og prófagerð'] = parseFloat(this.synid.verkefnisgerd*ein/3);
	  this.thaettir['Önnur vinna óháð nemendafjölda'] = parseFloat(this.synid.onnur_vinna*ein/3);
	  this.thaettir['Staðin kennsla'] = parseFloat(this.lengdKest*this.hperweek*15/60);
	  this.thaettir['Undirbúningur kennslu'] = parseFloat(this.synid.undirb_kennslu*this.hperweek*15/60);
	  var fast = (this.synid.timar_namsAetlun + this.synid.verkefnisgerd + this.synid.onnur_vinna)*ein/3;
	  var kennslustundir = (this.lengdKest + this.synid.undirb_kennslu)/60*this.hperweek*15;
	  var per_nemandi = (this.synid.vinna_per_nemanda)*ein/(3*60);
	  var nemendur = 0; 
	  var total;
	 
	  if (this.fjoldi <= this.synid.hamark_n) {
	    nemendur = Math.max(this.fjoldi,this.synid.lagmark)*per_nemandi;
	  }
	  else if (this.synid.hamark_n < this.fjoldi && this.fjoldi <= this.synid.hamark_e) {
	    nemendur = this.synid.hamark_n*per_nemandi;
	    nemendur = nemendur + (this.fjoldi-this.synid.hamark_n)*this.synid.kostn_per_nem_yn*ein/3;
	  }
	  else {
	    nemendur = this.synid.hamark_n*per_nemandi;
	    nemendur = nemendur + (this.synid.hamark_e-this.synid.hamark_n)*this.synid.kostn_per_nem_yn*ein/3+ (this.fjoldi-this.synid.hamark_e)*this.synid.kostn_per_nem_ye*ein/3;
	  }
	  total = fast + kennslustundir + nemendur
	  this.thaettir['Vinna vegna nemenda'] = nemendur;

	  this.vm = total;
	};
	exports.Afangi.prototype.skerda = function (p) {
	  this.vm = this.vm*(1-p);
	  this.skerding = p;
	  this.thaettir['Kennsluáætlun'] = parseFloat(this.thaettir['Kennsluáætlun'])*parseFloat(1-p);
	  this.thaettir['Verkefnis og prófagerð'] =  parseFloat(this.thaettir['Verkefnis og prófagerð'])*parseFloat(1-p);
	  this.thaettir['Önnur vinna óháð nemendafjölda'] =   parseFloat(this.thaettir['Önnur vinna óháð nemendafjölda'])*parseFloat(1-p);
	  this.thaettir['Staðin kennsla'] = parseFloat(this.thaettir['Staðin kennsla'])*parseFloat(1-p);
	  this.thaettir['Undirbúningur kennslu'] = parseFloat(this.thaettir['Undirbúningur kennslu'])*parseFloat(1-p);
	  this.thaettir['Vinna vegna nemenda'] = parseFloat(this.thaettir['Vinna vegna nemenda'])*parseFloat(1-p);
	};
	exports.Afangi.prototype.setVinnumat = function (vinnumat) {
	  this.vm = vinnumat;
	};

	exports.Afangi.prototype.toString = function() {
	  return "Heiti: "+ b + this.heiti + " Einingar: " + this.einingar + " Fjöldi: " + this.fjoldi + " vm: " + this.vm;
	};

  	exports.Kennari = function (nafn,afangar) {
	  this.heiti = nafn;
	  this.afangar = [];
	  this.originalAfangar = [];
	  

	  afangar.forEach(function(afangi){
	    this.originalAfangar.push(new Afangi(afangi));
	  },this);
	  for (var i = 0; i < this.originalAfangar.length; i++) {
	    this.originalAfangar[i].reikna_vinnumat();
	  }
	  afangar.forEach(function(afangi){
	    this.afangar.push(new Afangi(afangi));
	  },this);

	
	  this.originalAfangarVinnumat = [];
	  this.ryrnun = [];
	  this.fjoldi = this.originalAfangar.length;
	  this.ryra();
	};
	
	
	exports.Kennari.prototype.compare = function (a,b) {
	  if (a.heiti == b.heiti) {
	    return 0;
	  }
	  else if (a.heiti < b.heiti) {
	    return -1;
	  }
	  else {
	    return 1;
	  }
	};
	exportsKennari.prototype.vinnuskylda = function(klstChluti,vinnuskyldaTexti) {
	   var vinnuskylda = 0;
	   if (vinnuskyldaTexti === '30 ára-' ) {
	      vinnuskylda = 720;
	   }
	   else if (vinnuskyldaTexti === '30-37 ára') {
	     vinnuskylda = 708;
	   }
	   else if (vinnuskyldaTexti === '38-54 ára') {
	    vinnuskylda = 696;
	   }
	   else if (vinnuskyldaTexti === '55-59 ára') {
	    vinnuskylda = 667;
	   }
	   else if (vinnuskyldaTexti === '60 ára+ (17 tímar)') {
	    vinnuskylda = 493;
	   }
	   else {
	    vinnuskylda = 551;
	   }

	  if (vinnuskylda > 667) {
	    return parseFloat(vinnuskylda);
	  }
	  else {
	    var h = parseFloat(klstChluti)/parseFloat(696);
	    if (h >= 1) {
	        return parseFloat(696);
	    }
	    else {
	       return h*parseFloat(696) + (1-h)*parseFloat(vinnuskylda);  
	    }
	  }
	};
	exports.Kennari.prototype.sort = function() {
	  this.afangar.sort(this.compare);
	};
	exports.Kennari.prototype.heildarvinnumat = function() {
	  var s = 0;
	  for (var i=0; i < this.fjoldi; i++) {
	    var raunvinnumat = this.originalAfangar[i].vinnumat()/parseFloat(100);
	    s += raunvinnumat;
	  }
	  return s;
	};

	exports.Kennari.prototype.toString = function() {
	  this.sort();
	  var s = this.heiti + '\n'; 
	  this.originalAfangar.forEach(function(afangi){
	    s += afangi.toString();
	    s += "\n";
	  });

	  return s;
	};
	exports.Kennari.prototype.ryra = function() {
	  this.sort();
	  for (var i = 0; i < this.fjoldi; i++) {
	    this.ryrnun.push(parseFloat(0));
	  }
	  var i = 0;
	  while (i < this.afangar.length) {
	    var j = i;
	    while (j < this.afangar.length && this.afangar[i].heiti == this.afangar[j].heiti) {
	      j += 1;
	    }
	    if (i == j) {
	      i += 1;
	      continue;
	    }
	    else {
	      var nfj = 0;
	      for (var s = i; s < j; s++) {
	        nfj += parseInt(this.afangar[s].fjoldi);
	      } // end of for.
	      var neFjAv = nfj/(j-i);
	      var param = new Array(this.afangar[i].heiti,this.afangar[i].einingar,neFjAv,this.afangar[i].synid.heiti,this.afangar[i].hperweek,this.afangar[i].lengdKest);
	      var shadow = new Afangi(param);
	      shadow.reikna_vinnumat();
	      for (var k = 0; k < this.originalAfangar.length; k++) {
	        if ((j-i) == 2 && this.originalAfangar[k].heiti == this.afangar[i].heiti) {
	          this.ryrnun[k]=0.04*parseFloat(shadow.vinnumat());
	          this.originalAfangar[k].skerda(0.04);
	        }
	        else if ((j-i) == 3 && this.originalAfangar[k].heiti == this.afangar[i].heiti) {
	          this.ryrnun[k] = 0.16/parseFloat(3)*parseFloat(shadow.vinnumat());
	          this.originalAfangar[k].skerda(0.16/parseFloat(3));

	        }
	        else if ((j-i) > 3 && this.originalAfangar[k].heiti == this.afangar[i].heiti){
	          this.ryrnun[k] = 0.08*(j-i-2)/(j-i)*parseFloat(shadow.vinnumat());
	          this.originalAfangar[k].skerda(0.08*parseFloat(j-i-2)/parseFloat(j-i));
	        }
	      }// end of for
	      i = j;
	    }// end of else
	  }// end of while
	  
	};
	exports.Kennari.prototype.getName = function () {
	    return this.heiti;
	};

	exports.launatafla01032013 = toflur.launatafla01032013;
  	exports.launatafla01092016 = toflur.launatafla01092016;
  	exports.aldur = ['30 ára-','30-37 ára','38-54 ára','55-59 ára','60 ára+'];
  	exports.launatafla = {'30 ára-': [{'launaflokkur': '5','threp': '4'}, {'launaflokkur': '6','threp': '4'}],
  						'30-37 ára': [{'launaflokkur': '7','threp': '4'}, {'launaflokkur': '8','threp': '4'}],
  						'38-54 ára':  [{'launaflokkur': '8','threp': '4'}, {'launaflokkur': '9','threp': '4'}, {'launaflokkur': '10','threp': '4'}],
  						'55-59 ára': [{'launaflokkur': '10','threp': '4'}],
  						'60 ára+': [{'launaflokkur': '10','threp': '4'}]
  	
  	};
  	exports.afangar = ['Félagsgreinar','Íslenska','Raungreinar','Sjúkraliðanám','Stærðfræði','Tungumál'];
    exports.litir = {'30 ára-': "#d7191c",
  						'30-37 ára': "#fdae61;",
  						'38-54 ára':  "#ffffbf",
  						'55-59 ára': "#abd9e9",
  						'60 ára+': "#2c7bb6"
  	
  	};

	exports.generate2013 = function(nemendafjoldi,afangafjoldi) {
		return [];

	}
	
  }
)(this.generator = {})