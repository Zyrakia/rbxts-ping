type Callback = (...args: any[]) => void;

export class Ping<Handler extends Callback = () => void> {
	private event = new Instance('BindableEvent');
	public readonly connector = new PingConnector<Handler>(this.event);

	public fire(...args: Parameters<Handler>) {
		this.event.Fire(...(args as unknown[]));
	}

	public connect(handler: Handler) {
		return this.connector.connect(handler);
	}

	public destroy() {
		this.event.Destroy();
	}
}

class PingConnector<Handler extends Callback> {
	public constructor(private event: BindableEvent) {}

	public connect(handler: Handler) {
		return this.event.Event.Connect(handler) as RBXScriptConnection;
	}

	public connectParallel(handler: Handler) {
		return this.event.Event.ConnectParallel(handler);
	}

	public wait() {
		return this.event.Event.Wait();
	}
}
