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
	public constructor(private event: BindableEvent<Handler>) {}

	public connect(handler: Handler) {
		const conn = this.event.Event.Connect(handler);
		return new PingConnection(conn);
	}

	public connectParallel(handler: Handler) {
		const conn = this.event.Event.ConnectParallel(handler);
		return new PingConnection(conn);
	}

	public wait() {
		return this.event.Event.Wait()[0] as Parameters<Handler>;
	}
}

class PingConnection {
	public constructor(private connection: RBXScriptConnection) {}

	public disconnect() {
		this.connection.Disconnect();
	}

	public destroy() {
		this.connection.Disconnect();
	}

	public isConnected() {
		return this.connection.Connected;
	}
}
