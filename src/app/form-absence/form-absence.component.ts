import { Component, Input,OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AbsenceService } from '../shared/service/absence.service';
import {NgbModal,NgbModalRef, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { Absence } from '../shared/domain/absence';
import { Collaborateur } from '../shared/domain/collaborateur';
import { AbsenceType, ABSENCES_TYPES } from '../shared/domain/absence-type.enum';
import {IMyDpOptions, IMyDateModel,IMyDate} from 'mydatepicker';
import { AbsenceStatut, ABSENCES_STATUS } from '../absence-statut.enum';

@Component({
  selector: 'app-form-absence',
  templateUrl: './form-absence.component.html',
  styleUrls: ['./form-absence.component.css']
})
export class FormAbsenceComponent implements OnInit {
  // Absence concerné par le formulaire
  @Input() absence:Absence;
  // Nom de l'action permettant d'identifier le rôle du formulaire (ajout ou modification)
  @Input() action:string;
  // Attributs permettant d'afficher le bouton d'ouverture de la modale
  add:boolean = false; // affiche le bouton pour ajouter une absence
  modif:boolean = false; // affiche le bouton pour modifier une absence
  // Titre du formulaire
  titre:string;
  // Collaborateur connecté
  collaborateur:Collaborateur = new Collaborateur("bd540e65","Rossi","Roberts");
  // Attribut permettant d'activer ou non le boutons pour soumettre le formulaire
  isValid: boolean = false;
  // Attribut permettant d'afficher une alerte si les dates sont invalides
  isInvalidDate:boolean = false;
  // Options du select des types d'absences
  options:any = ABSENCES_TYPES;
  // Message d'erreur ou de succès suite à l'envoi des données sur le serveur
  msg:string
  // Attribut permettant d'afficher ou non le message d'alert msg
  succesAjout:boolean = false;
  alertActive:boolean = false;

  // Paramètres de la modale
  closeResult: string;
  dialog: NgbModalRef | null;

  // Options du DatePicker
  public myDatePickerOptions: IMyDpOptions = {
    dateFormat: 'dd/mm/yyyy',
    dayLabels: {su: 'Dim', mo: 'Lun', tu: 'Mar',we: 'Mer', th: 'Je', fr: 'Ven', sa: 'Sam'},
    monthLabels : { 1: 'Jan', 2: 'Fev', 3: 'Mar', 4: 'Avr', 5: 'Mai', 6: 'Jui', 7: 'Jui', 8: 'Aoû', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec' },
    todayBtnTxt : "Aujourd'hui",
    firstDayOfWeek: "mo",
    satHighlight: true
  };

  // Attributs pour modifier la valeur des dates
  private selDateDebut: IMyDate = {year: 0, month: 0, day: 0};
  private selDateFin: IMyDate = {year: 0, month: 0, day: 0};
  // Objet qui récupère la date de début saisie
  dateDebut:any;
  // Objet qui récupère la date de fin saisie
  dateDeFin:any;
  // Objet Date qui stock la date actuelle
  currentDate:Date;

  constructor(private absenceService:AbsenceService,private modalService: NgbModal) {}

  ngOnInit() {
    this.currentDate = new Date();
    // initialisation du formulaire selon son rôle
    if(this.action === "add") {
      this.add = true;
      this.titre = "Demande d'absence"; 
      this.absence = new Absence(0,"","","","","",this.collaborateur);
      this.selDateDebut = {year: this.currentDate.getFullYear(), month: this.currentDate.getMonth() +1, day: this.currentDate.getDate()+1};
      this.selDateFin = {year: this.currentDate.getFullYear(), month: this.currentDate.getMonth() +1, day: this.currentDate.getDate()+1};
      console.log(this.currentDate);
      this.currentDate.setDate(this.currentDate.getDate()+1);
      this.dateDebut = this.currentDate;
      this.dateDeFin = this.currentDate;

    } else if(this.action === "update") {
      this.modif = true;
      this.titre = "Modifier une absence";

      //Récupérationn date de début de l'absence
      let dateDebutnumb:any = Date.parse(this.absence.dateDebut);
      let deb:Date = new Date(dateDebutnumb);
      this.selDateDebut = {year: deb.getFullYear(), month: deb.getMonth()+1, day:deb.getDate()};
      this.dateDebut = deb;

      //Récupérationn date de fin de l'absence
      let dateFinnum:any = Date.parse(this.absence.dateFin);
      let fin:Date = new Date(dateFinnum);
      this.selDateFin = {year: fin.getFullYear(), month: fin.getMonth()+1, day:fin.getDate()};
      this.dateDeFin = fin;
    }
    // Desactivation des dates precedente à la date actuelle
    this.myDatePickerOptions.disableUntil = {year: this.currentDate.getFullYear(), month: this.currentDate.getMonth() +1, day: this.currentDate.getDate()-1};
  }

  // Affichage de la modale
  open(content) {
    this.dialog = this.modalService.open(content);
    this.dialog.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  // Disparition de la modale
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

  submit() {
    this.isValid = true;
    this.absence.dateDebut = this.dateDebut.getFullYear() + "-" + this.dateDebut.getMonth() + 1 + "-"  + this.dateDebut.getDate() ;
    this.absence.dateFin = this.dateDeFin.getFullYear() + "-" + this.dateDeFin.getMonth() + 1 + "-"  + this.dateDeFin.getDate() ;
    this.absence.statut = AbsenceStatut.INITIALE;
    console.log(this.absence);
    
    if(this.action === "add") {
      this.absenceService.sauvegarderAbsence(this.absence).subscribe(result => {
        this.alertActive = false;
        console.log('result ',result);
        if(result != null) {
          this.absenceService.refreshAbsencesByMatricule();
          if ( this.dialog ) {
            this.dialog.dismiss();
            this.dialog = null;
         }
        }		else {
          this.alertActive = true;
          this.msg = "Votre demande n'a pas pu être ajouté."
        }	
        
      },err => {
        console.log(err);
        this.alertActive = true;
        this.msg = "Votre demande n'a pas pu être ajouté.";
        this.isValid = true;

      },
    );
    } else if(this.action === "mofif") {
      this.absenceService.modifierAbsence(this.absence).subscribe(result => {
        this.alertActive = false;
        console.log('result ',result);
        if(result != null) {
          this.absenceService.refreshAbsencesByMatricule();
          if ( this.dialog ) {
            this.dialog.dismiss();
            this.dialog = null;
         }
        }		else {
          this.alertActive = true;
          this.msg = "Votre demande n'a pas pu être modifié."
        }	
        
      },err => {
        console.log(err);
        this.alertActive = true;
        this.msg = "Votre absence n'a pas pu être modifié.";
        this.isValid = true;

      },
    );
    }
    
  }

  // Ecouteur sur la de début
  onDateDebutChanged(event: IMyDateModel) {
    this.dateDebut = event.jsdate;
    // test si la date de début est valide
    this.absence.dateDebut = event.epoc; // Récupération du nombre de millisecondes depuis le 1er janvier 1970
    if(this.absence.dateDebut > this.absence.dateFin) {
      this.dateDebut = event.jsdate;
      this.isInvalidDate = true;
    } else {
      this.isInvalidDate = false;
    }
    this.onAlertChanged(event);
  }

  // Ecouteur sur la de fin
  onDateFinChanged(event: IMyDateModel) {
    this.dateDeFin = event.jsdate;
    this.absence.dateFin = event.epoc; // Récupération du nombre de millisecondes depuis le 1er janvier 1970
    // test si la date de fin est valide
    if(this.absence.dateDebut > this.absence.dateFin) {
      this.isInvalidDate = true;
    }else {
      this.isInvalidDate = false;
    }
    this.onAlertChanged(event);
  }

  onAlertChanged(event: any) {
    this.isValid = false;
    if(this.absence.dateDebut <= this.absence.dateFin ) {
      if(this.absence.type === "CONGE_SANS_SOLDE" && this.absence.motif != "") {
        this.isValid = true;
      } else if (this.absence.type != "CONGE_SANS_SOLDE" && this.absence.type != "") {
        this.isValid = true;
      }
    }
  }

  closeAlert() {
		this.alertActive = false;
	}

}
