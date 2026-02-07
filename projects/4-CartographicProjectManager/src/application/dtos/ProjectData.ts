import {ProjectType} from '@domain/enums/ProjectType';
import {GeoCoordinates} from '@domain/value-objects/GeoCoordinates';

/**
 * Project creation/update data DTO
 */
export interface ProjectData {
  code: string;
  name: string;
  clientId?: string;
  type: ProjectType;
  startDate: Date;
  deliveryDate: Date;
  coordinates: GeoCoordinates;
}
