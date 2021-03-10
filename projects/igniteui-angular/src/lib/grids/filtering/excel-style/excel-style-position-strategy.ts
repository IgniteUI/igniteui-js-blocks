import { AutoPositionStrategy } from '../../../services/overlay/position/auto-position-strategy';
import { ConnectedFit } from '../../../services/overlay/utilities';

/** @hidden */
export class ExcelStylePositionStrategy extends AutoPositionStrategy {
    protected shouldFitInViewPort() {
        return true;
    }

    protected fitInViewport(element: HTMLElement, connectedFit: ConnectedFit) {
        const heightOverflow = connectedFit.contentElementRect.height - connectedFit.viewPortRect.height;
        if (heightOverflow > 0) {
            element.style.width = 'auto';
            element.style.height = `${connectedFit.viewPortRect.height}px`;
        } else {
            element.style.height = `${Math.max(
                connectedFit.viewPortRect.height - connectedFit.targetRect.bottom - 1,
                connectedFit.contentElementRect.height)}px`;
        }

        super.fitInViewport(element, connectedFit);
    }
}
