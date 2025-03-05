import React from 'react';
import { useParams } from 'react-router-dom';
import { TribeView } from './TribeView';

export function TribeDetails() {
  // TribeDetails is just a wrapper for TribeView
  // No need to duplicate the hooks as TribeView already handles this logic
  return <TribeView />;
} 