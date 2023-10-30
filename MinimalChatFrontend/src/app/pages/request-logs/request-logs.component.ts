import { Component } from '@angular/core';
import { LogsService } from 'src/app/core/services/logs.service';

@Component({
  selector: 'app-request-logs',
  templateUrl: './request-logs.component.html',
  styleUrls: ['./request-logs.component.css']
})
export class RequestLogsComponent {
  logs: any[] = [];
  startTime?: Date;
  endTime?: Date;
  showColumns: string[] = ['timestamp', 'method', 'url', 'status', 'requestBody'];
  showIdColumn: boolean = true;
  showTimestampColumn: boolean = true;
  showIpAddressColumn: boolean = true;
  showUsernameColumn: boolean = true;
  showRequestBodyColumn: boolean = true;

  constructor(private logService:LogsService) { }

// ngOnInit Method
// Description: This method is a lifecycle hook that is called after Angular has initialized all data-bound properties.
// In this method, an initial action is performed when the component is loaded.
// In this specific case, the component fetches the last 5Minutes logs when it is initialized.
  ngOnInit(): void {
    this.getLastLogs(5);
  }

// getLogs Method
// Description: This method retrieves logs by making a service call. It subscribes to the service's observable to get the response data.
// When the response is received, it assigns the data to the component's 'logs' property.
  getLogs(): void {
    this.logService.getLogs().subscribe((res)=>{
       this.logs=res;
    })
  }

  // getLastLogs Method
// Description: This method retrieves logs within a specified time frame by making a service call. 
// It takes the number of minutes as a parameter and calculates the start and end time for the log query.
// It then calls the logService's getLogs method with the formatted start and end times to fetch logs.
// When the response is received, it assigns the data to the component's 'logs' property.
  getLastLogs(minutes: number) {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - minutes * 60000);
    this.logService.getLogs(this.formatDate( startTime),this.formatDate(endTime)).subscribe((res)=>{
       this.logs=res;
    },(error)=>{
      console.log(error.error);
      this.logs=[];
    })
  }

  // customTime Method
// Description: This method retrieves logs within a custom time frame specified by the user.
// It uses the 'startTime' and 'endTime' properties of the component, which are assumed to be set by the user.
// It calls the logService's getLogs method with the formatted start and end times to fetch logs.
// When the response is received, it assigns the data to the component's 'logs' property.
  customTime(){
    this.logService.getLogs(this.startTime?.toString(),this.endTime?.toString()).subscribe((res)=>{
       this.logs=res;
    })
  }

  // showSelectedColumns Method
// Description: This method checks if a specific column is included in the list of columns to be displayed.
// It takes a 'column' parameter representing the name of the column to be checked.
// It returns a boolean value indicating whether the specified column should be displayed or not.
  showSelectedColumns(column: string): boolean {
    return this.showColumns.includes(column);
  }

// formatDate Method
// Description: This method formats a JavaScript Date object into a string representation following the format: 'YYYY-MM-DDTHH:mm'.
// It takes a 'date' parameter representing the Date object to be formatted.
// It returns a string representing the formatted date and time.
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = this.padZero(date.getMonth() + 1);
    const day = this.padZero(date.getDate());
    const hours = this.padZero(date.getHours());
    const minutes = this.padZero(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // padZero Method
// Description: This method ensures that a number less than 10 is formatted as a string with a leading zero.
// It takes a 'num' parameter representing the number to be formatted.
// It returns a string representing the formatted number with a leading zero if necessary.
  padZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }
 
  //toggleColumn Method
  // Description: This method toggles the visibility of specific columns in a data table based on the provided column name.
  // It takes a 'columnName' parameter representing the name of the column to be toggled.
  toggleColumn(columnName: string) {
    switch (columnName) {
      case 'id':
        this.showIdColumn = !this.showIdColumn;
        break;
      case 'timestamp':
        this.showTimestampColumn = !this.showTimestampColumn;
        break;
      case 'ipAddress':
        this.showIpAddressColumn = !this.showIpAddressColumn;
        break;
      case 'username':
        this.showUsernameColumn = !this.showUsernameColumn;
        break;
      case 'requestBody':
        this.showRequestBodyColumn = !this.showRequestBodyColumn;
        break;
      default:
        break;
    }
  }
}
