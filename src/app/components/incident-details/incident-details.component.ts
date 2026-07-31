import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-incident-details',
  templateUrl: './incident-details.component.html',
  styleUrls: ['./incident-details.component.css']
})
export class IncidentDetailsComponent implements OnChanges {
  @Input() incident: any;
  @Output() close = new EventEmitter<void>();

  comments: any[] = [];
  newComment = '';
  loadingComments = false;

  constructor(private api: ApiService) {}

  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: KeyboardEvent) {
    this.closeModal();
  }

  closeModal() {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['incident'] && this.incident) {
      if (!this.incident.media_url && this.incident.attachments && this.incident.attachments.length > 0) {
        this.incident.media_url = this.incident.attachments[0].file_url;
      }
      this.loadComments();
    }
  }

  loadComments() {
    this.loadingComments = true;
    this.api.getComments(this.incident.id).subscribe({
      next: (data) => {
        this.comments = data;
        this.loadingComments = false;
      },
      error: () => this.loadingComments = false
    });
  }

  onAddComment() {
    if (!this.newComment.trim()) return;
    
    this.api.addComment(this.incident.id, this.newComment).subscribe({
      next: (comment) => {
        this.comments.push(comment);
        this.newComment = '';
      },
      error: () => alert('Erro ao adicionar comentário.')
    });
  }

  onConfirm() {
    this.api.confirmIncident(this.incident.id).subscribe({
      next: (res) => {
        this.incident.confirmations_count = res.confirmations_count;
        alert('Você confirmou este incidente.');
      },
      error: (err) => alert(err.error?.detail || 'Erro ao confirmar incidente.')
    });
  }
}
