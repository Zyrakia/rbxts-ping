type Args = any[];
type Callback = (...args: Args) => void;

type ParseHandler<T> = T extends Callback
	? ReturnType<T> extends void
		? T
		: (...args: Parameters<T>) => void
	: T extends Args
	? (...args: T) => void
	: never;

export class Ping<Handler extends Callback | Args = []> {
	public readonly connector: PingConnector<Handler>;

	public constructor(private event = new Instance('BindableEvent')) {
		this.connector = new PingConnector<Handler>(this.event);
	}

	/**
	 * Fire the ping and alert all connections.
	 *
	 * @param args The arguments to pass to any connections.
	 */
	public fire(...args: Parameters<ParseHandler<Handler>>) {
		this.event.Fire(...(args as unknown[]));
	}

	/**
	 * Connect to the ping, alias for {@link PingConnector.connect}.
	 *
	 * @param handler The handler to call when the ping is fired.
	 * @returns The connection object.
	 */
	public connect(handler: ParseHandler<Handler>) {
		return this.connector.connect(handler);
	}

	/**
	 * Yield until the next time the ping is fired.
	 * Alias for {@link PingConnector.wait}.
	 */
	public wait() {
		return this.connector.wait();
	}

	/**
	 * Destroys the ping and disconnects all connections.
	 */
	public destroy() {
		this.event.Destroy();
	}
}

export class PingConnector<Handler extends Callback | Args> {
	public constructor(private event: BindableEvent<ParseHandler<Handler>>) {}

	/**
	 * Connect to the ping.
	 *
	 * @param handler The handler to call when the ping is fired.
	 * @returns The connection object.
	 */
	public connect(handler: ParseHandler<Handler>) {
		const conn = this.event.Event.Connect(handler);
		return new PingConnection(conn);
	}

	/**
	 * Connect to the ping. (Parallel)
	 *
	 * @param handler The handler to call when the ping is fired.
	 * @returns The connection object.
	 */
	public connectParallel(handler: ParseHandler<Handler>) {
		const conn = this.event.Event.ConnectParallel(handler);
		return new PingConnection(conn);
	}

	/**
	 * Yields until the next time the ping is fired.
	 *
	 * @returns The arguments passed to the ping.
	 */
	public wait() {
		return this.event.Event.Wait()[0] as Parameters<ParseHandler<Handler>>;
	}
}

export class PingConnection {
	public constructor(private connection: RBXScriptConnection) {}

	/**
	 * Disconnects the connection.
	 */
	public disconnect() {
		this.connection.Disconnect();
	}

	/**
	 * Disconnects the connection.
	 * Alias for {@link PingConnection.disconnect}.
	 */
	public destroy() {
		this.connection.Disconnect();
	}

	/**
	 * Returns whether the connection is connected.
	 */
	public isConnected() {
		return this.connection.Connected;
	}
}
