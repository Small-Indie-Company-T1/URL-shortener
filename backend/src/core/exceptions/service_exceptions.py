from src.core.exceptions.app_exceptions import AppException


class ServiceException(AppException):
    """Ошибки бизнес-логики сервисов"""
    status_code = 400

class NotFoundException(ServiceException):
    """Ресурс не найден"""
    status_code = 404

class ForbiddenException(ServiceException):
    """Недостаточно прав"""
    status_code = 403

class UnauthorizedException(ServiceException):
    """Ошибка авторизации"""
    status_code = 401
