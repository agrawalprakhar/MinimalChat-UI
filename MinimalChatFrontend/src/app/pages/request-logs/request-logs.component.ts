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

  ngOnInit(): void {
    this.getLogs();
  }


  getLogs(): void {

    console.log(this.startTime,this.endTime)
    this.logService.getLogs().subscribe((res)=>{
       this.logs=res;
    })
  }

  getLastLogs(minutes: number) {
    console.log(minutes);
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - minutes * 60000);
    console.log(startTime,endTime)
    console.log(this.formatDate( startTime),this.formatDate(endTime))
    this.logService.getLogs(this.formatDate( startTime),this.formatDate(endTime)).subscribe((res)=>{
      console.log(res);
       this.logs=res;
    },(error)=>{
      console.log(error.error);
      this.logs=[];
    })
  }

  customTime(){
    console.log(this.startTime,this.endTime)
    this.logService.getLogs(this.startTime?.toString(),this.endTime?.toString()).subscribe((res)=>{
      console.log(res);
       this.logs=res;
    })
  }
  showSelectedColumns(column: string): boolean {
    return this.showColumns.includes(column);
  }
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = this.padZero(date.getMonth() + 1);
    const day = this.padZero(date.getDate());
    const hours = this.padZero(date.getHours());
    const minutes = this.padZero(date.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
  padZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }
 

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
