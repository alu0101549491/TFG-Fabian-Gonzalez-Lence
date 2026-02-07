/**
 * @module application/dto/project-data
 * @description Data Transfer Object for project creation and update operations.
 * @category Application
 */

import {ProjectType} from '@domain/enumerations/project-type';

/**
 * Data required to create or update a project.
 */
export interface ProjectData {
  /** Project name/title. */
  name: string;
  /** Project code identifier. */
  code: string;
  /** ID of the assigned client. */
  clientId: string;
  /** Type of cartographic project. */
  type: ProjectType;
  /** Expected delivery date. */
  deliveryDate: Date;
  /** Geographic coordinates of the project location. */
  coordinates: {
    latitude: number;
    longitude: number;
  };
}
