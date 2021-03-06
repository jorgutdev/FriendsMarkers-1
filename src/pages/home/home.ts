import { Component } from '@angular/core';
import { NavController, NavParams, Platform, FabContainer, FabButton } from 'ionic-angular';
import { AlertController, LoadingController, ActionSheetController, ToastController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { MapsProvider } from '../../providers/maps';
import { MarkersProvider } from '../../providers/markers';
import { AuthProvider } from '../../providers/auth';

import { GoogleMaps, GoogleMapsEvent, LatLng, CameraPosition, MyLocation, Marker} from '@ionic-native/google-maps';



@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
	
	public mapRendered: Boolean = false;
  public location: LatLng;
  public myLocation: MyLocation;
	public clickableMap : any = true;
	public db : any;
  public fabContainer : FabContainer;
  public fabButton : FabButton
	public mapName : string = "Public Map";

  constructor(public navCtrl: NavController, 
  	public navParams : NavParams,
  	public platform: Platform, 
  	public loadingCtrl : LoadingController,
  	public toastCtrl : ToastController,  
  	public alertCtrl: AlertController, 
  	public af : AngularFireDatabase, 
  	public auth: AngularFireAuth, 
  	public actionSheetCtrl : ActionSheetController, 
  	private googleMaps: GoogleMaps,
  	public markersProvider : MarkersProvider,
  	public authProvider : AuthProvider,
  	public mapsProvider : MapsProvider) {

    MapsProvider.mapSaved.setOptions({ 
        'backgroundColor': 'white',
        'controls': { 
          'compass': true,
          'myLocationButton': true,
          'indoorPicker': true
        },
        'gestures': { 
          'scroll': true,
          'tilt': true, 
          'rotate': true,
          'zoom': true  
        }
      });


    console.log('HomePage | Constructor | navParams.data', navParams.data)
    if(!navParams.data.id){
      navParams.data.id = 'public'
      MapsProvider.mapUID = 'public'
    }
    this.loadMarkersFromMap(navParams.data.id)	
  }


ionViewDidLoad(){ 

  console.log('HomePage | ionViewDidLoad');
  console.log('HomePage | ionViewDidLoad | this.map is null!! ');
  MapsProvider.mapSaved.setDiv(document.getElementById('map'));
  MapsProvider.mapSaved.on(GoogleMapsEvent.MAP_LONG_CLICK).subscribe(
    (mapClick) => {this.promptAddMarker(mapClick);}, 
    (err) => { console.log(err); 
  });
  this.getLocationAndMoveCamera(); 

}


clearMarkers(){
  for ( var i = 0; i < MapsProvider.markersArray.length; i++){
    let marker : Marker = MapsProvider.markersArray[i];
    marker.remove();
  }
}

refresh(){
  this.markersProvider.placeMarkersFromArray();
}







loadMarkersFromMap(mapSelectedUID){
	this.disableMap();
  MapsProvider.mapUID = mapSelectedUID;
  this.mapsProvider.getNameFromMapUID(mapSelectedUID, this);
  console.log("Loading markers from map id ", mapSelectedUID);
  let loader = this.loadingCtrl.create();
  loader.present()
	this.markersProvider.getMarkersFromMap(loader);
}



selectMap(){
  this.disableMap();
	let alert = this.alertCtrl.create();
  alert.setTitle('Available Maps');
  alert.onDidDismiss(() => this.enableMap());
	var loader = this.loadingCtrl.create();
  loader.present();
 	alert.addInput({ type: 'radio', label: 'Public map', value: 'public', });
  this.mapsProvider.getMapsFromUser(alert, loader);
  alert.addButton('Cancel');
  alert.addButton({ text: 'OK',
    handler: data => {
      console.log('Data --> ', data);
      console.log('Loading map with id ', data);
      this.loadMarkersFromMap(data);
      }
  });
}




menuShowing(){
	this.disableMap();
}

disableMap(){
	this.clickableMap = false;
  console.log("Map clickable? ",this.clickableMap)
	MapsProvider.mapSaved.setClickable(false);
}
enableMap(){
	this.clickableMap = true;
  console.log("Map clickable? ",this.clickableMap)
	MapsProvider.mapSaved.setClickable(true);
}


toggleMapClick(){
  this.clickableMap = !this.clickableMap
  console.log("Map clickable? ",this.clickableMap)
	MapsProvider.mapSaved.setClickable(this.clickableMap);
}









   getLocationAndMoveCamera(){
    let loader = this.loadingCtrl.create({ content: "Getting location ... please wait." });
    loader.present();
    MapsProvider.mapSaved.getMyLocation().then((location) => {
        console.log("getMyLocation | Location is ", location);
        let position : CameraPosition = { target: location.latLng, zoom: 15 };
        MapsProvider.mapSaved.moveCamera(position);
        loader.dismiss();
  	}, (err) => {
          loader.dismiss();
          console.log(err);
          alert(err.error_message);
    });
   }





promptAddMap(){
  this.disableMap();
  console.log("HomePage | promptAddMap | Init ");
  let prompt = this.alertCtrl.create({
    title: 'Add map',
    message: "Enter a name for the new map ",
    inputs: [ { name: 'name', placeholder: 'Name'},
              { name: 'description', placeholder: 'Description' } ],
    buttons: [{text: 'Cancel', handler: data => { console.log('HomePage | promptAddMap | Cancel add map');}},
              {text: 'Save',   handler: data => {  this.mapsProvider.addMapToUser(data)}}]
  });
  prompt.onDidDismiss(() => {this.enableMap()})
  prompt.present()
}




  promptAddMarker(mapClick){
    console.log('HomePage | promptAddMarker | Init ')
    console.log('HomePage | promptAddMarker | mapClick ', mapClick)
    let prompt = this.alertCtrl.create({
        title: 'Add marker',
        message: 'Enter a name for this place',
        inputs: [ { name: 'title',       placeholder: 'Title' }],
        buttons: [{ text: 'Cancel', handler: data => console.log('HomePage | promptAddMarker | Cancel add marker')},
          { text: 'Save', handler: data => {
              this.markersProvider.addMarkerToMap(data, mapClick+"".toString());
          }}]
      });
    prompt.onDidDismiss(() => this.enableMap())
    prompt.present().then(() => this.disableMap());
   }

  



}

 
