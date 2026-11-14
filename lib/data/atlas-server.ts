import 'server-only';
import { cache } from 'react';
import { database } from '@/lib/database';
import { readAtlas } from './read-atlas';

export const getAtlasData = cache(() => readAtlas(database));
