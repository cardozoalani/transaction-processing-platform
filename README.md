# Transaction Processing Platform

## Descripción

Transaction Processing Platform es una solución escalable y altamente eficiente diseñada para procesar grandes volúmenes de transacciones. Está construida con un enfoque en la arquitectura de microservicios y utiliza tecnologías como Kubernetes, AWS Lambda, AWS SQS, ALB, Prometheus, Grafana, y un sistema de autoscaling con Horizontal Pod Autoscaler (HPA).

El sistema está preparado para entornos de producción con configuración de observabilidad y monitoreo, pruebas de rendimiento automatizadas y CI/CD para despliegues continuos.

## Escalabilidad y Consistencia Eventual

El diseño de este sistema está optimizado para la escalabilidad y una consistencia eventual, especialmente en el manejo de validaciones de transferencias. La función Lambda encargada de recibir los mensajes encolados en SQS para ejecutar las validaciones en el `compliance-service` está configurada para enviar las transacciones en lotes, lo cual permite procesar un gran volumen de transacciones de forma eficiente. Este enfoque reduce la carga en el servicio compliance-service y permite un balance en el uso de recursos, manteniendo la capacidad de procesar transacciones a alta velocidad y asegurando que el sistema sea escalable.

## Flujo del Algoritmo de Validación

El algoritmo de validación está diseñado para detectar fraudes y asegurar la integridad de las transacciones mediante varias reglas y verificaciones. Estas incluyen:

1. **Verificación de Procesamiento Previo**:  
   Si el estado de verificación de fraude (`fraudCheckStatus`) de la transacción ya está marcado como `approved` o `rejected`, se omiten las demás verificaciones.

2. **Monto Excesivo en Comparación con el Promedio**:

   - La transacción es rechazada si el monto excede cinco veces el promedio de transacciones de la cuenta en los últimos 30 días.
   - Para cuentas nuevas sin historial de transacciones, esta regla se omite.

3. **Fallos Recientes**:

   - Las transacciones se rechazan si la cuenta ha registrado tres o más transacciones fallidas en las últimas 24 horas.

4. **Alta Frecuencia de Transacciones Recientes**:

   - Si una cuenta ha realizado diez o más transacciones en los últimos 10 minutos, se activa un rechazo.

5. **Ubicación Sospechosa**:

   - La transacción se marca como sospechosa si la ubicación actual no coincide con la última ubicación conocida para la cuenta.

6. **Patrón de Gasto Inusual**:

   - Una cuenta se marca como sospechosa si el monto de la transacción excede cinco veces el promedio de transacciones en los últimos 30 días, o si se han realizado diez o más transacciones en los últimos 60 minutos.

7. **Horas de Alto Riesgo**:

   - Las transacciones se rechazan si se procesan entre las 2:00 a.m. y las 6:00 a.m. en la zona horaria local de la cuenta.

8. **Aprobación Final**:
   - Si ninguna de las condiciones anteriores activa un rechazo, la transacción es aprobada.

Estas reglas se aplican de forma secuencial, y cualquier condición que resulte en un rechazo impide que se realicen más verificaciones para esa transacción.

Cada chequeo genera un estado que se actualiza en la transacción, marcando su progreso y resultado en términos de aprobación o rechazo.

### Reservas de Balance

Si la transacción pasa las validaciones iniciales y se encuentra en estado `pending`, se realiza una reserva del monto de la transacción en el balance de la cuenta. Esto asegura que el balance refleje correctamente la operación mientras se completa la validación final.

- **Si la transacción es validada y aprobada**, el monto reservado se descuenta permanentemente del balance de la cuenta.
- **Si la transacción falla la validación**, la reserva se libera y el monto regresa al balance disponible de la cuenta.

## Entorno Local con LocalStack, minikube y Skaffold

Para el entorno local, se configuró LocalStack para emular los servicios de AWS necesarios, facilitando así el desarrollo y las pruebas sin requerir acceso directo a la infraestructura de la nube. Asimismo, se emplea Skaffold en combinación con Minikube para el despliegue y la gestión de contenedores localmente, asegurando que los microservicios y demás componentes funcionen de manera similar al entorno de producción, pero en un ambiente controlado y eficiente para el desarrollo.

## Requisitos

Asegúrate de tener instalados los siguientes programas en tu máquina:

- [Docker](https://docs.docker.com/get-docker/)
- [Minikube](https://minikube.sigs.k8s.io/docs/start/)
- [Skaffold](https://skaffold.dev/docs/install/)
- [Terraform](https://www.terraform.io/downloads.html)
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)

## Instalación

### 1. Docker

Docker es una plataforma que permite crear, desplegar y ejecutar aplicaciones dentro de contenedores.

**Para instalar Docker:**

- En Windows y Mac, puedes usar [Docker Desktop](https://www.docker.com/products/docker-desktop).
- En Linux, sigue las [instrucciones oficiales de instalación](https://docs.docker.com/engine/install/).

### 2. Minikube

Minikube es una herramienta que facilita la ejecución de Kubernetes localmente.

**Para instalar Minikube:**

- En sistemas Windows, Mac y Linux, puedes usar el siguiente comando:

  ```bash
   curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
   sudo install minikube-linux-amd64 /usr/local/bin/minikube && rm minikube-linux-amd64
  ```

  - Consulta la [documentación oficial para más detalles.](https://minikube.sigs.k8s.io/docs/start/)

### 3. Skaffold

Skaffold es una herramienta que facilita el desarrollo de aplicaciones en Kubernetes.

**Para instalar Skaffold:**

- Ejecuta el siguiente comando:

```bash
curl -Lo skaffold https://storage.googleapis.com/skaffold/releases/latest/skaffold-linux-amd64 && \
sudo install skaffold /usr/local/bin/
```

- O sigue las instrucciones de instalación de la [documentación oficial.](https://skaffold.dev/docs/install/)

### 4. Terraform

Terraform es una herramienta para construir, cambiar y versionar infraestructura de forma segura y eficiente.
**Para instalar Skaffold:**

- Ejecuta el siguiente comando:

```bash
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform
```

- O sigue las instrucciones de instalación de la [documentación oficial.](https://www.terraform.io/downloads.html)

### 5. kubectl

`kubectl` es la herramienta de línea de comandos para interactuar con Kubernetes. Te permite gestionar aplicaciones en un clúster de Kubernetes, así como obtener información sobre el clúster y sus recursos.
**Para instalar kubectl:**

- En sistemas basados en Debian/Ubuntu, puedes usar el siguiente comando:

```bash
sudo apt-get update && sudo apt-get install -y kubectl
```

- En sistemas Mac, puedes instalarlo usando Homebrew:

```bash
brew install kubectl
```

- O sigue las instrucciones de instalación de la [documentación oficial.](https://kubernetes.io/docs/tasks/tools/install-kubectl/)

## Inicializar el Proyecto

Una vez que hayas instalado todos los requisitos, sigue estos pasos para levantar el entorno local:
**1. Inicia Minikube con el controlador de Docker:**

```bash
minikube start --driver=docker
```

**2. Levanta el entorno con Skaffold:**

```bash
skaffold dev
```

Esto iniciará el proceso de desarrollo y aplicará las configuraciones de Kubernetes necesarias. Skaffold manejará la construcción de los contenedores y el despliegue en el clúster de Minikube.

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
- **Skaffold**: Herramienta para desplegar y gestionar los contenedores en Minikube durante el desarrollo.
