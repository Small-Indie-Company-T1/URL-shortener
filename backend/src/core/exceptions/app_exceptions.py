class AppException(Exception):
    """Базовое исключение для всего приложения"""
    ...

class DatabaseConnectionError(AppException):
    """Ошибка подключения к БД"""
    ...