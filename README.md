# Transaction Processing Platform

## Descripción

Transaction Processing Platform es una solución escalable y altamente eficiente diseñada para procesar grandes volúmenes de transacciones. Está construida con un enfoque en la arquitectura de microservicios y utiliza tecnologías como Kubernetes, AWS Lambda, AWS SQS, ALB, Prometheus, Grafana, y un sistema de autoscaling con Horizontal Pod Autoscaler (HPA).

El sistema está preparado para entornos de producción con configuración de observabilidad y monitoreo, pruebas de rendimiento automatizadas y CI/CD para despliegues continuos.

## Escalabilidad y Consistencia Eventual

El diseño de este sistema está optimizado para la escalabilidad y una consistencia eventual, especialmente en el manejo de validaciones de transferencias. La función Lambda encargada de recibir los mensajes encolados en SQS para ejecutar las validaciones en el `compliance-service` está configurada para enviar las transacciones en lotes, lo cual permite procesar un gran volumen de transacciones de forma eficiente. Este enfoque reduce la carga en el servicio compliance-service y permite un balance en el uso de recursos, manteniendo la capacidad de procesar transacciones a alta velocidad y asegurando que el sistema sea escalable.

## Entorno Local con LocalStack, minikube y Skaffold

Para el entorno local, se configuró LocalStack para emular los servicios de AWS necesarios, facilitando así el desarrollo y las pruebas sin requerir acceso directo a la infraestructura de la nube. Asimismo, se emplea Skaffold en combinación con Minikube para el despliegue y la gestión de contenedores localmente, asegurando que los microservicios y demás componentes funcionen de manera similar al entorno de producción, pero en un ambiente controlado y eficiente para el desarrollo.

## Postman Collection

Para facilitar las pruebas de la API, se creo una collection de Postman que cubre los endpoints principales del proyecto, divididos en dos dominios: `Accounts` y `Transactions`.

La colección incluye:

- **Accounts**:
  - Crear cuenta
  - Obtener cuenta por ID
- **Transactions**:
  - Crear transacción
  - Obtener transacciones por ID de cuenta

### Cómo utilizar la colección

1. Descarga la colección de Postman desde [este enlace](https://api.postman.com/collections/16659493-85146f29-77dd-4be3-b166-b40109ebe9b4?access_key=PMAT-01JBV4HF7WJ3WDXMQXVN53V1H4).
2. Importa el archivo JSON en Postman:

   - Abre Postman.
   - Ve a **File > Import** y selecciona el archivo JSON de la colección.

3. Asegúrate de configurar las variables de entorno necesarias en Postman:
   - **balance**: Cantidad de saldo inicial de la cuenta.
   - **owner**: Propietario de la cuenta.
   - **currency**: Moneda utilizada.
   - **dailyLimit**: Límite diario de transacciones.
   - **accountId**: ID de la cuenta para realizar transacciones y consultas.
   - **amount**: Monto de la transacción.
   - **transactionType**: Tipo de transacción (`debit`).

### Variables de Entorno

En la colección, se utilizan variables que puedes ajustar en las configuraciones de entorno de Postman.

## Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Microservicios](#microservicios)
- [Componentes Principales](#componentes-principales)
  - [Load Balancer](#load-balancer)
  - [HPA](#hpa)
  - [Lambda Functions](#lambda-functions)
  - [CI/CD](#ci-cd)
  - [Prometheus y Grafana](#prometheus-y-grafana)
- [Pruebas](#pruebas)
  - [Pruebas con K6](#pruebas-con-k6)
  - [Pruebas con Jest](#pruebas-con-jest)
- [Despliegue](#despliegue)
- [Requisitos](#requisitos)

## Arquitectura

El sistema está organizado en microservicios desplegados en Kubernetes. Cada microservicio está diseñado para gestionar aspectos específicos del procesamiento de transacciones, desde la validación de fraude hasta el almacenamiento en DynamoDB. Los microservicios se comunican mediante un Application Load Balancer (ALB) en AWS y utilizan autoscaling para gestionar la carga.

## Microservicios

1. **Account Service**: Gestiona la información de cuentas y maneja operaciones como la verificación y reserva de saldo.
2. **Transaction Processor API**: Procesa las transacciones de los usuarios y maneja la lógica de negocio principal.
3. **Transaction Compliance Service**: Valida las transacciones contra reglas de cumplimiento configuradas.

Cada uno de estos servicios tiene configurado un endpoint `/metrics` para su monitoreo y observabilidad mediante Prometheus y Grafana.

## Componentes Principales

### Load Balancer

Se configuró un Application Load Balancer (ALB) que distribuye el tráfico entre los microservicios. Este balanceador permite manejar grandes volúmenes de solicitudes y habilita el autoscaling de los pods en Kubernetes.

### HPA

Se configuró un Horizontal Pod Autoscaler (HPA) para cada microservicio, que ajusta el número de réplicas según el uso de CPU, manteniendo la escalabilidad del sistema en respuesta a la carga.

### Lambda Functions

El sistema incluye una Lambda que se comunica con el servicio `compliance-service` que se ejecuta mediante una cola SQS.

### CI/CD

Se utiliza GitHub Actions para el CI/CD del proyecto. Cada push y pull request desencadena un pipeline que realiza el despliegue del proyecto.

### Prometheus y Grafana

Para la observabilidad, se añadieron Prometheus y Grafana, que monitorean métricas clave de cada microservicio. Esto facilita la visualización y análisis del rendimiento del sistema.

## Pruebas

### Pruebas con K6

Se creó un script de K6 para pruebas de carga y estrés en la infraestructura, permitiendo validar la configuración de HPA y la respuesta del sistema ante altas demandas.

### Pruebas con Jest

- **Unit Testing**: Las pruebas unitarias están desarrolladas con Jest. Para la emulación de DynamoDB y SQS en las pruebas, se utiliza un cliente mock que simula las interacciones con AWS.
- **Cobertura**: Para ejecutar las pruebas con cobertura:

  ```bash
  npm run test:cov
  ```

## Despliegue

El proyecto se despliega en un cluster de EKS en AWS. Se usa Terraform para gestionar la infraestructura, que incluye recursos como SQS, Lambda, DynamoDB, y las configuraciones de seguridad de la VPC.

Para ejecutar el despliegue:

1. Clonar el repositorio y entrar al directorio del proyecto.
2. Configurar las variables necesarias en el entorno, como `AWS_REGION`, `SQS_QUEUE_URL`, `COMPLIANCE_SERVICE_URL`, etc.
3. Ejecutar los comandos de Terraform para aplicar la infraestructura:

   ```bash
   terraform init
   terraform plan
   terraform apply -var="environment=production"
   ```

4. Iniciar el despliegue de los microservicios en el cluster de EKS.

## Requisitos

- **Node.js** v16 o superior: Necesario para ejecutar el entorno de desarrollo y las pruebas locales.
- **Terraform** v1.0 o superior: Utilizado para la infraestructura como código, gestionando los recursos de AWS necesarios.
- **AWS CLI** configurado con las credenciales de producción: Requerido para interactuar con los servicios de AWS y gestionar configuraciones.
- **kubectl** configurado para el cluster de EKS: Necesario para desplegar y gestionar los recursos de Kubernetes en el clúster de EKS.
- **LocalStack**: Utilizado en el entorno local para emular los servicios de AWS.
- **Skaffold**: Herramienta para desplegar y gestionar los contenedores en Minikube durante el desarrollo.
