import { Injectable } from "@angular/core";
import { JourFerie } from "../domain/jour-ferie";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, Subject } from "rxjs";
import { environment as env } from "../../../environments/environment";

@Injectable()
export class JoursFeriesService {
  joursFeries: JourFerie[];
  ferieSubj = new BehaviorSubject<JourFerie[]>([]);

  constructor(private http: HttpClient) {
    this.refreshJoursFeries();
  }

  supprimerJourFerie(jourFerieId: number): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ "Content-Type": "application/json" })
    };
    console.log("jourFerieId:" + jourFerieId);
    return this.http.delete<JourFerie>(
      "http://localhost:8080/jours_feries/" + jourFerieId
    );
  }

  refreshJoursFeries() {
    this.http
      .get<JourFerie[]>(env.urlBackEndJoursFeries)
      .subscribe(j => this.ferieSubj.next(j));
  }

  sauvegarderJourFerie(newJoursFeries: JourFerie): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ "Content-Type": "application/json" })
    };
    return this.http.post<JourFerie>(
      env.urlBackEndJoursFeries,
      newJoursFeries,
      httpOptions
    );
  }

  modifierJourFerie(modifJoursFeries: JourFerie): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ "Content-Type": "application/json" })
    };
    return this.http.put<JourFerie>(
      env.urlBackEndJoursFeries + modifJoursFeries.id,
      modifJoursFeries,
      httpOptions
    );
  }
}