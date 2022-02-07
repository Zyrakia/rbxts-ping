type Args = any[];
type Callback = (...args: Args) => void;
type HandlerType = Args | Callback | defined;

type ParseHandler<T extends HandlerType> = T extends Args
	? (...args: T) => void
	: T extends Callback
	? ReturnType<T> extends void
		? T
		: (...args: Parameters<T>) => void
	: (argument: T) => void;

export class Ping<Handler extends HandlerType = []> {
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
		this.event.Fire(...args);
	}

	/**
	 * Spawns a new task that will fire the ping and alert all connections.
	 *
	 * @param args The arguments to pass to any connections.
	 */
	public fireAsync(...args: Parameters<ParseHandler<Handler>>) {
		task.spawn(() => this.event.Fire(...args));
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
	 * Yields until the next time the ping is fired, then returns the result.
	 * Alias for {@link PingConnector.wait}.
	 */
	public wait() {
		return this.connector.wait();
	}

	/**
	 * Destroys the internal BindableEvent, disconnecting all connections.
	 */
	public destroy() {
		this.event.Destroy();
	}
}

export class PingConnector<Handler extends HandlerType> {
	public constructor(private event: BindableEvent<ParseHandler<Handler>>) {}

	/**
	 * Connect a callback to the ping that will get called
	 * whenever the ping is fired.
	 *
	 * @param handler The handler to call when the ping is fired.
	 * @returns The connection object.
	 */
	public connect(handler: ParseHandler<Handler>) {
		const conn = this.event.Event.Connect(handler);
		return new PingConnection(conn);
	}

	/**
	 * (Parallel) Connect a callback to the ping that will get called
	 * whenever the ping is fired.
	 *
	 * @param handler The handler to call when the ping is fired.
	 * @returns The connection object.
	 */
	public connectParallel(handler: ParseHandler<Handler>) {
		const conn = this.event.Event.ConnectParallel(handler);
		return new PingConnection(conn);
	}

	/**
	 * Yields until the next time the ping is fired, then returns the result.
	 *
	 * @returns The arguments passed when the ping was fired.
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
