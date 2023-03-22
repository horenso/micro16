import { library } from '@fortawesome/fontawesome-svg-core';

// Icons
import {
    faPlay,
    faPause,
    faFloppyDisk,
    faGear,
    faArrowRotateRight,
} from '@fortawesome/free-solid-svg-icons';

export function importIcons() {
    library.add(faPlay, faPause, faFloppyDisk, faGear, faArrowRotateRight);
}
