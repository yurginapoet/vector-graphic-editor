/**
 * Универсальный реестр для хранения и получения объектов по ключу.
 * Используется для паттернов Стратегия и Фабрика.
 */
export class Registry<T> {
    private items = new Map<string, T>();

    register(key: string, item: T): void {
        this.items.set(key, item);
    }

    get(key: string): T | undefined {
        return this.items.get(key);
    }

    getAll(): T[] {
        return Array.from(this.items.values());
    }
}
