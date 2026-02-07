import {Project} from '../../../../src/domain/entities/Project';
import {ProjectType} from '../../../../src/domain/enums/ProjectType';
import {ProjectStatus} from '../../../../src/domain/enums/ProjectStatus';
import {
  GeoCoordinates,
} from '../../../../src/domain/value-objects/GeoCoordinates';

describe('Project Entity', () => {
  let project: Project;
  const coordinates = new GeoCoordinates(28.4636, -16.2518);

  beforeEach(() => {
    project = new Project(
      'proj-1',
      'PRJ-001',
      'Test Project',
      'client-1',
      ProjectType.RESIDENTIAL,
      new Date('2025-01-01'),
      new Date('2025-12-31'),
      coordinates,
    );
  });

  describe('constructor', () => {
    it('should create a project with valid properties', () => {
      expect(project.getId()).toBe('proj-1');
      expect(project.getCode()).toBe('PRJ-001');
      expect(project.getName()).toBe('Test Project');
      expect(project.getClientId()).toBe('client-1');
      expect(project.getType()).toBe(ProjectType.RESIDENTIAL);
    });

    it('should set initial status to ACTIVE', () => {
      expect(project.getStatus()).toBe(ProjectStatus.ACTIVE);
    });

    it('should set empty dropbox folder id', () => {
      expect(project.getDropboxFolderId()).toBe('');
    });
  });

  describe('setStatus', () => {
    it('should update project status', () => {
      project.setStatus(ProjectStatus.IN_PROGRESS);
      expect(project.getStatus()).toBe(ProjectStatus.IN_PROGRESS);
    });
  });

  describe('setDropboxFolderId', () => {
    it('should update dropbox folder id', () => {
      project.setDropboxFolderId('folder-123');
      expect(project.getDropboxFolderId()).toBe('folder-123');
    });
  });
});
